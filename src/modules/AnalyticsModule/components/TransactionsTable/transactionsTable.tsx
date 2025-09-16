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
            <div className="flex gap-3 w-full items-center p-4 pb-0">
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
                <div className="grid grid-cols-2 gap-2 md:flex max-md:w-full">
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
                        className="flex h-10 min-w-[130px] items-center gap-2 whitespace-nowrap rounded-lg p-4"
                        variant={currentTxTypes?.includes("Swap") ? "iconActive" : "outline"}
                    >
                        <ArrowDownUp size={16} />
                        <span>Swaps</span>
                    </Button>
                    <Button
                        onClick={() => {
                            if (!currentTxTypes.includes("Mint")) {
                                setFilterTxTypes([...currentTxTypes, "Mint"]);
                            } else setFilterTxTypes(currentTxTypes.filter((t) => t !== "Mint"));
                        }}
                        className="flex h-10 min-w-[130px] items-center gap-2 whitespace-nowrap rounded-lg p-4"
                        variant={currentTxTypes?.includes("Mint") ? "iconActive" : "outline"}
                    >
                        <ImagePlus size={16} />
                        <span>Mints</span>
                    </Button>
                    <Button
                        onClick={() => {
                            if (!currentTxTypes.includes("Burn")) {
                                setFilterTxTypes([...currentTxTypes, "Burn"]);
                            } else setFilterTxTypes(currentTxTypes.filter((t) => t !== "Burn"));
                        }}
                        className="flex h-10 min-w-[130px] items-center gap-2 whitespace-nowrap rounded-lg p-4"
                        variant={currentTxTypes?.includes("Burn") ? "iconActive" : "outline"}
                    >
                        <Flame size={16} />
                        <span>Burns</span>
                    </Button>
                    <Button
                        onClick={() => {
                            if (!currentTxTypes.includes("Collect")) {
                                setFilterTxTypes([...currentTxTypes, "Collect"]);
                            } else setFilterTxTypes(currentTxTypes.filter((t) => t !== "Collect"));
                        }}
                        className="flex h-10 min-w-[130px] items-center gap-2 whitespace-nowrap rounded-lg p-4"
                        variant={currentTxTypes?.includes("Collect") ? "iconActive" : "outline"}
                    >
                        <Coins size={16} />
                        <span>Collects</span>
                    </Button>
                    <Button
                        onClick={() => {
                            setFilterTxTypes(["Swap", "Mint", "Collect", "Burn"]);
                        }}
                        className={cn(
                            "flex h-10 w-fit items-center gap-2 whitespace-nowrap rounded-lg border border-light border-transparent p-4 max-lg:hidden max-md:col-span-2",
                            currentTxTypes.length < 4 ? "" : "hidden"
                        )}
                        variant={"outline"}
                    >
                        <span>Reset</span>
                        <X size={18} />
                    </Button>
                </div>
                {totalRows > 0 && (
                    <p className="ml-auto flex h-12 items-center rounded-lg bg-lighter p-2 px-6 max-md:hidden">Weekly total: {totalRows}</p>
                )}
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
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className="border-card-border/40 bg-card-dark hover:bg-card-hover cursor-pointer"
                                onClick={() => window.open(`${chain?.blockExplorers?.default.url}/tx/${row.original.hash}`)}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="text-left min-w-[160px] first:min-w-[140px]">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {showPagination && (
                <div className="mt-auto flex items-center justify-end space-x-2 px-4">
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
            )}
        </>
    );
}
