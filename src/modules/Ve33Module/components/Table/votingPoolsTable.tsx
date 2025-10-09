import { useCallback, useMemo, useRef, useState } from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { HeaderItem } from "@/components/common/Table/common";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/utils/common/formatAmount";
import { Address, formatUnits } from "viem";
import { Search, Vote, X } from "lucide-react";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { FormattedVotingPool, VotingData } from "../../types/voting";
import { VoteMap } from "../VotingPoolsList";
import { LoadingState } from "@/components/common/Table/loadingState";
import { unwrappedToken } from "@/utils/common/unwrappedToken";

const VoteInput = ({
    poolAddress,
    value,
    onChange,
    onMax,
    disabled,
    isReadOnly,
}: {
    poolAddress: Address;
    value: string;
    onChange: (address: Address, value: number) => void;
    onMax: (address: Address) => void;
    disabled: boolean;
    isReadOnly: boolean;
}) => {
    const handleChange = useCallback(
        (input: string) => {
            if (input === "") {
                onChange(poolAddress, 0);
                return;
            }

            const regex = /^(\d{0,3})(\.\d{0,2})?$/;
            if (!regex.test(input)) return;

            const num = parseFloat(input);
            if (isNaN(num) || num > 100) return;

            onChange(poolAddress, num);
        },
        [onChange, poolAddress]
    );

    const handleBlur = useCallback(() => {
        const num = parseFloat(value);
        if (isNaN(num) || value === "") {
            onChange(poolAddress, 0);
        } else {
            const finalValue = Math.min(100, Math.max(0, num));
            onChange(poolAddress, finalValue);
        }
    }, [value, onChange, poolAddress]);

    const handleMaxClick = useCallback(() => {
        onMax(poolAddress);
    }, [poolAddress, onMax]);

    if (isReadOnly && Number(value) > 0) {
        return <span className="justify-end flex text-primary-200">{value}% voted</span>;
    } else if ((isReadOnly && Number(value) === 0) || disabled) {
        return <span className="justify-end flex text-muted-foreground">-</span>;
    }

    return (
        <div className="flex items-center gap-2 justify-end">
            <Input
                value={value}
                onUserInput={handleChange}
                onBlur={handleBlur}
                placeholder="0"
                className="h-8 w-20 text-right bg-card border border-border focus:border-primary-500 px-2"
                disabled={disabled || isReadOnly}
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                readOnly={isReadOnly}
            />
            <span className="text-sm">%</span>
            {isReadOnly ? (
                <span className="text-sm text-primary-200">Voted</span>
            ) : (
                <Button size="sm" variant="default" className="font-medium py-1 px-2 h-auto" onClick={handleMaxClick} disabled={disabled}>
                    Max
                </Button>
            )}
        </div>
    );
};

interface VotingPoolsTableProps {
    pools: FormattedVotingPool[];
    votingData: VotingData | undefined;
    votes: VoteMap;
    isReadOnly: boolean;
    selectedTokenId: number | undefined;
    isLoading: boolean;
    setVotes: React.Dispatch<React.SetStateAction<VoteMap>>;
}

export const VotingPoolsTable = ({ pools, votingData, votes, isReadOnly, selectedTokenId, isLoading, setVotes }: VotingPoolsTableProps) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 40,
    });

    const votesRef = useRef<VoteMap>({});
    votesRef.current = votes;

    const handleVoteChange = useCallback((poolAddress: Address, value: number) => {
        if (isReadOnly) return;
        setVotes((prev) => {
            const newVotes = { ...prev };
            if (value === 0) {
                delete newVotes[poolAddress];
            } else {
                newVotes[poolAddress] = value;
            }
            return newVotes;
        });
    }, []);

    const handleMax = useCallback((poolAddress: Address) => {
        if (isReadOnly) return;
        setVotes((prev) => {
            const otherVotesTotal = Object.entries(prev).reduce((sum, [addr, val]) => (addr === poolAddress ? sum : sum + val), 0);
            const available = Math.max(0, 100 - otherVotesTotal);
            const newVotes = { ...prev, [poolAddress]: available };
            return newVotes;
        });
    }, []);

    const columns = useMemo<ColumnDef<FormattedVotingPool>[]>(
        () => [
            {
                accessorKey: "pair",
                header: () => <HeaderItem className="pl-2">Pool</HeaderItem>,
                cell: ({ row }) => {
                    const p = row.original;
                    const token0 = unwrappedToken(p.token0);
                    const token1 = unwrappedToken(p.token1);
                    return (
                        <div className="flex items-center gap-4 min-w-[180px]">
                            <CurrencyLogo currency={token0} size={32} />
                            <CurrencyLogo className="-ml-6" currency={token1} size={32} />

                            <div className="flex flex-col">
                                <span className="whitespace-nowrap">{`${token0.symbol} - ${token1.symbol}`}</span>
                            </div>
                        </div>
                    );
                },
                filterFn: (v, _, value) =>
                    [v.original.token0.symbol, v.original.token1.symbol, v.original.token0.name, v.original.token1.name]
                        .join(" ")
                        .toLowerCase()
                        .includes(value.toLowerCase()),
            },
            {
                accessorKey: "tvlUSD",
                header: ({ column }) => (
                    <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                        TVL
                    </HeaderItem>
                ),
                meta: { className: "table-cell min-w-20 text-left" },
                cell: ({ getValue }) => `$${formatAmount(getValue() as number, 2)}`,
            },
            {
                accessorKey: "feesUSD",
                header: ({ column }) => (
                    <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                        Fees
                    </HeaderItem>
                ),
                meta: { className: "table-cell min-w-20" },
                cell: ({ getValue }) => `$${formatAmount(getValue() as number, 2)}`,
            },
            {
                accessorKey: "incentivesUSD",
                header: ({ column }) => (
                    <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                        Incentives
                    </HeaderItem>
                ),
                meta: { className: "table-cell" },
                cell: ({ getValue }) => `$${formatAmount(getValue() as number, 2)}`,
            },
            {
                accessorKey: "totalRewardsUSD",
                header: ({ column }) => (
                    <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                        Total Rewards
                    </HeaderItem>
                ),
                meta: { className: "table-cell" },
                cell: ({ getValue }) => `$${formatAmount(getValue() as number, 2)}`,
            },
            {
                accessorKey: "vApr",
                header: ({ column }) => (
                    <div className="table-cell">
                        <HeaderItem
                            sort={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            isAsc={column.getIsSorted() === "asc"}
                        >
                            vAPR
                        </HeaderItem>
                    </div>
                ),
                cell: ({ getValue }) => <span>{formatAmount(getValue() as number, 2)}%</span>,
            },
            {
                accessorKey: "votePercentage",
                header: ({ column }) => (
                    <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                        Vote %
                    </HeaderItem>
                ),
                accessorFn: (row) => {
                    if (!votingData?.totalVotes || votingData.totalVotes === 0n) {
                        return 0;
                    }
                    const poolVotes = Number(formatUnits(row.poolVotesDeposited, 18));
                    const totalVotes = Number(formatUnits(votingData.totalVotes, 18));
                    return (poolVotes / totalVotes) * 100;
                },
                cell: ({ row }) => {
                    const pool = row.original;
                    // if (!votingData?.totalVotes || votingData.totalVotes === 0n) {
                    //     return <span className="text-text-200">-</span>;
                    // }

                    const poolVotes = Number(formatUnits(pool.poolVotesDeposited, 18));
                    const totalVotes = Number(formatUnits(votingData?.totalVotes || 1n, 18));
                    const percentage = (poolVotes / totalVotes) * 100;

                    return (
                        <div className="group relative cursor-help">
                            <span>{formatAmount(percentage, 2)}%</span>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                {formatAmount(poolVotes, 2)} veTOKEN votes
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                        </div>
                    );
                },
                meta: { className: "table-cell min-w-20 text-center" },
            },
            {
                id: "vote",
                header: () => (
                    <div className="text-right pr-2">
                        <HeaderItem>My Votes</HeaderItem>
                    </div>
                ),
                cell: ({ row }) => {
                    const p = row.original;
                    return (
                        <VoteInput
                            poolAddress={p.address}
                            value={votesRef.current[p.address]?.toString() || ""}
                            onChange={handleVoteChange}
                            onMax={handleMax}
                            disabled={!selectedTokenId || !p.isAlive}
                            isReadOnly={isReadOnly}
                        />
                    );
                },
            },
        ],
        [votingData, handleVoteChange, handleMax, selectedTokenId, isReadOnly]
    );

    // Table instance
    const table = useReactTable({
        data: pools,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            pagination,
        },
        globalFilterFn: (row: any, _, value: boolean | undefined) => {
            const p = row.original;
            return value ? (votes[p.address] || 0) > 0 : true;
        },
    });

    if (isLoading) return <LoadingState />;

    if (!pools || pools.length === 0) {
        return <div className="flex gap-5 flex-col bg-card border border-card-border/60 rounded-xl p-24">No voting pools available</div>;
    }

    const isVoted: boolean | undefined = table.getState().globalFilter;

    const searchID = "pair";
    const totalRows = table.getFilteredRowModel().rows.length;
    const startsFromRow = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
    const endsAtRow = Math.min(startsFromRow + table.getState().pagination.pageSize - 1, totalRows);

    return (
        <div className="space-y-3 w-full">
            <div className="flex gap-5 flex-col pb-5 bg-card border border-card-border/60 rounded-xl">
                <div className="flex max-sm:flex-col gap-3 w-full items-center p-4 pb-0">
                    <div className="flex items-center relative w-full sm:w-fit">
                        <Input
                            placeholder="Search pool"
                            value={(table.getColumn(searchID)?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn(searchID)?.setFilterValue(event.target.value)}
                            className="border border-border border-opacity-60 pl-12 h-12 max-w-80 md:w-64 lg:w-80 focus:border-opacity-100 rounded-lg"
                        />
                        <Search className="absolute left-4 text-border" size={20} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:flex w-full sm:w-fit">
                        <Button
                            onClick={() => table.setGlobalFilter(isVoted ? undefined : true)}
                            variant={isVoted ? "iconHover" : "outline"}
                            size="md"
                            className="flex h-12 min-w-[130px] items-center gap-2 whitespace-nowrap rounded-lg p-4"
                        >
                            <Vote className="text-primary-200" size={16} />
                            <span>Voted Pools</span>
                        </Button>
                        <Button
                            hidden={!isVoted}
                            size="md"
                            onClick={() => {
                                table.setGlobalFilter(undefined);
                            }}
                            className="flex h-12 w-fit items-center gap-2 whitespace-nowrap rounded-lg border border-light border-transparent p-4"
                            variant="outline"
                        >
                            <span>Reset</span>
                            <X size={18} />
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader className="[&_tr]:border-b [&_tr]:border-opacity-30 border-t border-opacity-60">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="rounded-xl font-semibold [&_svg]:mt-auto">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="hover:bg-transparent text-[16px]">
                        {!table.getRowModel().rows.length ? (
                            <TableRow className="hover:bg-card h-full">
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row: any) => {
                                return (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="border-card-border/40 bg-card-dark hover:bg-card-hover/10"
                                    >
                                        {row.getVisibleCells().map((cell: any) => (
                                            <TableCell key={cell.id} className="text-left min-w-[120px] first:min-w-[220px]">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                <div className="flex items-center justify-end space-x-2 px-4 mt-auto">
                    {totalRows > 0 && (
                        <p className="mr-2">
                            {startsFromRow === totalRows
                                ? `${startsFromRow} of ${totalRows}`
                                : `${startsFromRow} - ${endsAtRow} of ${totalRows}`}
                        </p>
                    )}
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};
