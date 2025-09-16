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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { Token } from "@cryptoalgebra/custom-pools-sdk";
import { TokenColumn } from "./tokensColumns";
import { LoadingState } from "@/components/common/Table/loadingState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

    if (loading) return <LoadingState />;

    return (
        <>
            {searchID && (
                <div className="flex gap-3 w-full items-center p-4 pb-0">
                    <div className="flex items-center relative w-fit">
                        <Input
                            placeholder="Search token"
                            value={(table.getColumn(searchID)?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn(searchID)?.setFilterValue(event.target.value)}
                            className="border border-border border-opacity-60 pl-12 h-10 max-w-80 md:w-64 lg:w-80 focus:border-opacity-100 rounded-lg"
                        />
                        <Search className="absolute left-4 text-border" size={20} />
                    </div>
                </div>
            )}

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
                                onClick={() => {
                                    if (action) {
                                        action(row.original.id);
                                    } else if (link) {
                                        navigate(`/${link}/${row.original.id}`);
                                    }
                                }}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="text-left min-w-[120px] first:min-w-[220px]">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {showPagination && (
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
            )}
        </>
    );
}
