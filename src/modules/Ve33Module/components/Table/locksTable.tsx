import { LoadingState } from "@/components/common/Table/loadingState";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { useMemo, useState } from "react";
import { formatAmount } from "@/utils/common/formatAmount";
import { HeaderItem } from "@/components/common/Table/common";
import { getTimeUntilTimestamp } from "../../utils";
import TOKENLogo from "@/assets/algebra-logo.svg";
import { formatUnits } from "viem";
import { ManageLockModal } from "../ManageLockModal";
import { ClaimVotingRewardsModal } from "../ClaimVotingRewardsModal";
import { ClaimRebaseRewardsButton } from "../ClaimRebaseRewardsButton";
import { ExtendedVePosition } from "../../types";

interface DataTableProps {
    data: ExtendedVePosition[];
    refetch?: () => void;
    loading?: boolean;
}

export const LocksTable = ({ data, loading, refetch }: DataTableProps) => {
    const [sorting, setSorting] = useState<SortingState>([{ id: "balance", desc: true }]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const columns: ColumnDef<ExtendedVePosition>[] = useMemo(
        () => [
            {
                accessorKey: "tokenId",
                header: () => <HeaderItem className="min-w-[110px] ml-2">veTOKEN ID</HeaderItem>,
                cell: ({ row, getValue }) => (
                    <div className="ml-2 flex gap-4 items-center">
                        <img width={24} src={TOKENLogo} alt="VeTOKEN" />
                        <span>{`#${getValue()}`}</span>
                        {row.original.votedThisEpoch && <div className="py-1 px-3 rounded-lg bg-primary-200 text-xs">voted</div>}
                    </div>
                ),
            },
            {
                accessorKey: "lockedAmount",
                header: ({ column }) => (
                    <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                        Lock Amount
                    </HeaderItem>
                ),
                cell: ({ getValue }) => `${formatAmount(formatUnits(getValue() as bigint, 18), 2)} TOKEN`,
            },
            {
                accessorKey: "balance",
                header: ({ column }) => (
                    <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                        Voting Power
                    </HeaderItem>
                ),
                cell: ({ getValue }) => `${formatAmount(formatUnits(getValue() as bigint, 18), 2)} veTOKEN`,
            },
            {
                accessorKey: "lockedEnd",
                header: ({ column }) => (
                    <HeaderItem
                        className="min-w-[100px]"
                        sort={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        isAsc={column.getIsSorted() === "asc"}
                    >
                        Lock Expire
                    </HeaderItem>
                ),
                cell: ({ getValue }) => <span>{getTimeUntilTimestamp(getValue() as number).display}</span>,
            },
            {
                accessorKey: "rebaseRewards",
                header: () => <HeaderItem>Rebase Rewards</HeaderItem>,
                cell: ({ row }) => (
                    <ClaimRebaseRewardsButton amount={row.original.rebaseAmount} tokenId={row.original.tokenId} refetch={refetch} />
                ),
            },
            {
                accessorKey: "votingRewards",
                header: () => <HeaderItem>Voting Rewards</HeaderItem>,
                cell: ({ row }) => (
                    <ClaimVotingRewardsModal rewards={row.original.votingRewardList} tokenId={row.original.tokenId} refetch={refetch} />
                ),
            },
            {
                accessorKey: "manage",
                header: () => <HeaderItem />,
                cell: ({ row }) => (
                    <div className="flex gap-2 items-center justify-end">
                        <ManageLockModal veTOKEN={row.original} refetch={refetch} />
                    </div>
                ),
            },
        ],
        [refetch]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    if (loading) return <LoadingState />;

    return (
        <>
            <Table>
                <TableHeader className="[&_tr]:border-b-0">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent">
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className="rounded-xl font-semibold">
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className="hover:bg-transparent text-[16px]">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row: any) => {
                            return (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-card-border/40 bg-card-dark hover:bg-card-hover/10"
                                >
                                    {row.getVisibleCells().map((cell: any) => (
                                        <TableCell key={cell.id} className=" text-left">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow className="hover:bg-card h-full">
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <div className="flex items-center justify-end space-x-2 pt-4 pb-2 px-4 mt-auto">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                    Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                    Next
                </Button>
            </div>
        </>
    );
};
