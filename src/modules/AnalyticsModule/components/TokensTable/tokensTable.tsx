import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Search, X } from "lucide-react";
import { Token } from "@cryptoalgebra/integral-sdk";
import { TokenColumn } from "./tokensColumns";
import { LoadingState } from "@/components/common/Table/loadingState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface TokenData {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    price: number;
    volume: number;
    tvl: number;
    change: number;
    tokenSDK: Token;
}

interface TokenTableProps<TData, TValue> {
    columns: ColumnDef<TValue>[];
    data: TData[];
    action?: (args?: unknown) => void;
    defaultSortingID?: keyof TokenColumn;
    link?: string;
    showPagination?: boolean;
    searchID?: keyof TokenColumn;
    loading?: boolean;
}

export function TokensTable({
    columns,
    data,
    action,
    link,
    defaultSortingID,
    showPagination = true,
    loading,
    searchID,
}: TokenTableProps<TokenData | never, TokenColumn>) {
    const [sorting, setSorting] = useState<SortingState>(defaultSortingID ? [{ id: defaultSortingID, desc: true }] : []);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const navigate = useNavigate();

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    const totalRows = table.getFilteredRowModel().rows.length;
    const startsFromRow = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
    const endsAtRow = Math.min(startsFromRow + table.getState().pagination.pageSize - 1, totalRows);
    const hasSearch = columnFilters.length > 0;

    if (loading) return <LoadingState />;

    return (
        <>
            {searchID && (
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="relative w-full lg:max-w-sm">
                            <Input
                                placeholder="Search tokens..."
                                value={(table.getColumn(searchID)?.getFilterValue() as string) ?? ""}
                                onChange={(event) => table.getColumn(searchID)?.setFilterValue(event.target.value)}
                                className="pl-9"
                            />
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                        </div>

                        {hasSearch && (
                            <div className="flex items-center justify-end">
                                <Button
                                    size="md"
                                    onClick={() => {
                                        setColumnFilters([]);
                                    }}
                                    variant="outline"
                                >
                                    <span>Reset</span>
                                    <X size={14} />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="overflow-x-auto w-full max-w-[calc(100vw-2rem)]">
                <Table>
                    <TableHeader className="bg-panel [&_tr]:border-border/60 rounded-xl overflow-hidden">
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
                                <TableCell colSpan={columns.length} className="h-28 px-4 text-center">
                                    <div className="mx-auto max-w-sm space-y-2">
                                        <p className="text-base font-medium text-text">No tokens match the current view.</p>
                                        <p className="text-sm text-text-muted">Try adjusting your search criteria.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={cn(
                                        "border-border/60 bg-card transition-colors duration-150",
                                        action || link ? "hover:bg-panel/50 cursor-pointer" : "hover:bg-card",
                                    )}
                                    onClick={() => {
                                        if (action) {
                                            action(row.original.id);
                                        } else if (link) {
                                            navigate(`/${link}/${row.original.id}`);
                                        }
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="min-w-32 px-4 py-3.5 text-left first:min-w-56">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {showPagination && (
                    <TableFooter className="flex w-full gap-3 p-3 justify-between text-sm items-center col-span-4">
                        {totalRows > 0 ? (
                            <p className="text-sm text-text-muted">
                                {startsFromRow === totalRows
                                    ? `${startsFromRow} of ${totalRows}`
                                    : `${startsFromRow} - ${endsAtRow} of ${totalRows}`}
                            </p>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                <ChevronLeft size={16} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                <ChevronLeft size={16} className="rotate-180" />
                            </Button>
                        </div>
                    </TableFooter>
                )}
            </div>
        </>
    );
}
