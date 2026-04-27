import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    Updater,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownUp, Coins, Flame, ImagePlus, X } from "lucide-react";
import { TX } from "./transactionsColumns";
import { LoadingState } from "@/components/common/Table/loadingState";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { useAppKitNetwork } from "@reown/appkit/react";

interface TransactionsTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    action?: (args?: unknown) => void;
    defaultSortingID?: keyof TX;
    link?: string;
    showPagination?: boolean;
    searchID?: keyof TX;
    loading?: boolean;
}

export function TransactionsTable({ columns, data, defaultSortingID, showPagination = true, loading }: TransactionsTableProps<TX, TX>) {
    const [sorting, setSorting] = useState<SortingState>(defaultSortingID ? [{ id: defaultSortingID, desc: true }] : []);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const handleSortingChange = (updater: Updater<SortingState>) => {
        setSorting((prevSorting) => {
            const currentSorting = typeof updater === "function" ? updater(prevSorting) : updater;
            const [newSort] = currentSorting;

            if (newSort) {
                const currentSort = prevSorting.find((s) => s.id === newSort.id);

                if (currentSort) {
                    if (currentSort.desc) {
                        return [{ id: newSort.id, desc: false }];
                    }
                    return [{ id: newSort.id, desc: true }];
                }
                return [{ id: newSort.id, desc: true }];
            }
            return [];
        });
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,
        onSortingChange: handleSortingChange,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility: {
                fees24USD: !(window.innerWidth < 640),
            },
        },
    });

    const totalRows = table.getFilteredRowModel().rows.length;
    const startsFromRow = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
    const endsAtRow = Math.min(startsFromRow + table.getState().pagination.pageSize - 1, totalRows);

    const currentTxTypes = Array.isArray(table.getColumn("__typename")?.getFilterValue() as string[] | undefined)
        ? (table.getColumn("__typename")?.getFilterValue() as string[])
        : ["Swap", "Mint", "Collect", "Burn"];

    const setFilterTxTypes = table.getColumn("__typename")?.setFilterValue as (value: string[] | []) => void;

    const { caipNetwork: chain } = useAppKitNetwork();

    if (loading) return <LoadingState />;

    return (
        <>
            <div className="flex flex-col gap-4">
                {/* <ul className="flex h-12 w-fit gap-1 rounded-lg border border-border-light p-1">
                <li>
                  <Button
                    onClick={() => table.setGlobalFilter(undefined)}
                    className="h-full w-fit flex-nowrap rounded-[4px] p-4"
                    variant={!isMyPools ? 'iconActive' : 'ghost'}
                  >
                    All
                  </Button>
                </li>
                <li>
                </li>
              </ul> */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid w-full grid-cols-2 gap-2 md:flex md:flex-wrap lg:w-auto">
                        {/* <Button
                  className="flex h-12 min-w-[130px] items-center gap-2 rounded-lg"
                  variant={'outline'}
                >
                  <span>🔥</span>
                  <span>Hot Pools</span>
                </Button> */}
                        <Button
                            onClick={() => {
                                if (!currentTxTypes.includes("Swap")) {
                                    setFilterTxTypes([...currentTxTypes, "Swap"]);
                                } else setFilterTxTypes(currentTxTypes.filter((t) => t !== "Swap"));
                            }}
                            size={"md"}
                            variant={currentTxTypes?.includes("Swap") ? "ghostActive" : "outline"}
                        >
                            <ArrowDownUp size={14} />
                            <span>Swaps</span>
                        </Button>
                        <Button
                            onClick={() => {
                                if (!currentTxTypes.includes("Mint")) {
                                    setFilterTxTypes([...currentTxTypes, "Mint"]);
                                } else setFilterTxTypes(currentTxTypes.filter((t) => t !== "Mint"));
                            }}
                            size={"md"}
                            variant={currentTxTypes?.includes("Mint") ? "ghostActive" : "outline"}
                        >
                            <ImagePlus size={14} />
                            <span>Mints</span>
                        </Button>
                        <Button
                            onClick={() => {
                                if (!currentTxTypes.includes("Burn")) {
                                    setFilterTxTypes([...currentTxTypes, "Burn"]);
                                } else setFilterTxTypes(currentTxTypes.filter((t) => t !== "Burn"));
                            }}
                            size={"md"}
                            variant={currentTxTypes?.includes("Burn") ? "ghostActive" : "outline"}
                        >
                            <Flame size={14} />
                            <span>Burns</span>
                        </Button>
                        <Button
                            onClick={() => {
                                if (!currentTxTypes.includes("Collect")) {
                                    setFilterTxTypes([...currentTxTypes, "Collect"]);
                                } else setFilterTxTypes(currentTxTypes.filter((t) => t !== "Collect"));
                            }}
                            size={"md"}
                            variant={currentTxTypes?.includes("Collect") ? "ghostActive" : "outline"}
                        >
                            <Coins size={14} />
                            <span>Collects</span>
                        </Button>
                        <Button
                            onClick={() => {
                                setFilterTxTypes(["Swap", "Mint", "Collect", "Burn"]);
                            }}
                            className={cn(currentTxTypes.length < 4 ? "" : "hidden")}
                            variant={"outline"}
                            size={"md"}
                        >
                            <span>Reset</span>
                            <X size={18} />
                        </Button>
                    </div>

                    {totalRows > 0 && <p className="text-sm text-text-muted max-md:hidden">Last 7 days: {totalRows} transactions</p>}
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <Table className="min-w-[760px]">
                    <TableHeader className="border-y border-border bg-panel/70 [&_tr]:border-border/60">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="h-12 px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted [&_svg]:mt-auto"
                                    >
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="text-sm text-text">
                        {!table.getRowModel().rows.length ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={columns.length} className="h-24 px-4 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="cursor-pointer border-border/60 bg-card transition-colors duration-150 hover:bg-panel/50"
                                    onClick={() => window.open(`${chain?.blockExplorers?.default.url}/tx/${row.original.hash}`)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="min-w-40 px-4 py-3.5 text-left first:min-w-36">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {showPagination && (
                <div className="mt-auto flex items-center justify-between gap-3 px-0 pt-4 text-sm">
                    {totalRows > 0 && (
                        <p className="text-text-muted">
                            {startsFromRow === totalRows
                                ? `${startsFromRow} of ${totalRows}`
                                : `${startsFromRow} - ${endsAtRow} of ${totalRows}`}
                        </p>
                    )}

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
