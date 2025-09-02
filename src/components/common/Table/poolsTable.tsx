import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { LoadingState } from "./loadingState";
import { Input } from "@/components/ui/input";
import { Search, User, X } from "lucide-react";
import { enabledModules } from "config/app-modules";
import { useNavigate } from "react-router-dom";

type ActiveFilters = {
    hasActiveFarming?: boolean;
    hasALM?: boolean;
    isMyPool?: boolean;
};
interface PoolsTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    action?: (args?: any) => void;
    defaultSortingID?: string;
    link?: string;
    showPagination?: boolean;
    searchID?: string;
    loading?: boolean;
}

const PoolsTable = <TData, TValue>({
    columns,
    data,
    action,
    link,
    defaultSortingID,
    showPagination = true,
    loading,
}: PoolsTableProps<TData, TValue>) => {
    const [sorting, setSorting] = useState<SortingState>(defaultSortingID ? [{ id: defaultSortingID, desc: true }] : []);

    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            sorting,
            globalFilter: activeFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        onGlobalFilterChange: setActiveFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,

        globalFilterFn: (row: any, _columnId, filterValue) => {
            const f = filterValue as ActiveFilters;
            if (f.hasActiveFarming && !row.original.hasActiveFarming) return false;
            if (f.hasALM && !row.original.hasALM) return false;
            if (f.isMyPool && !row.original.isMyPool) return false;
            return true;
        },
    });

    const navigate = useNavigate();

    const searchID = "pair";

    const totalRows = table.getFilteredRowModel().rows.length;
    const startsFromRow = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
    const endsAtRow = Math.min(startsFromRow + table.getState().pagination.pageSize - 1, totalRows);

    const toggleFilter = (filterId: keyof ActiveFilters) => {
        setActiveFilters((prev) => ({
            ...prev,
            [filterId]: !prev[filterId],
        }));
    };

    const isFilterActive = (filterId: keyof ActiveFilters) => {
        return Boolean(activeFilters[filterId]);
    };

    if (loading) return <LoadingState />;

    return (
        <>
            {searchID && (
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
                        {enabledModules.farming && (
                            <Button
                                onClick={() => toggleFilter("hasActiveFarming")}
                                variant={isFilterActive("hasActiveFarming") ? "iconHover" : "outline"}
                                size="md"
                                className="flex h-12 min-w-[130px] items-center gap-2 whitespace-nowrap rounded-lg p-4"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 100 100">
                                    <defs>
                                        <radialGradient id="grad" cx="30%" cy="30%" r="70%">
                                            <stop offset="0%" stop-color="#fff9b1" />
                                            <stop offset="100%" stop-color="#f8d81c" />
                                        </radialGradient>

                                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.3" />
                                        </filter>
                                    </defs>

                                    <circle cx="50" cy="50" r="45" fill="url(#grad)" filter="url(#shadow)" />
                                </svg>
                                <span>Farm Pools</span>
                            </Button>
                        )}
                        {enabledModules.alm && (
                            <Button
                                onClick={() => toggleFilter("hasALM")}
                                variant={isFilterActive("hasALM") ? "iconHover" : "outline"}
                                size="md"
                                className="flex h-12 min-w-[130px] items-center gap-2 whitespace-nowrap rounded-lg p-4"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 100 100">
                                    <defs>
                                        <radialGradient id="grad-74f7df" cx="30%" cy="30%" r="70%">
                                            <stop offset="0%" stop-color="#d4fff8" />
                                            <stop offset="100%" stop-color="#74f7df" />
                                        </radialGradient>

                                        <filter id="shadow-74f7df" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.3" />
                                        </filter>
                                    </defs>

                                    <circle cx="50" cy="50" r="45" fill="url(#grad-74f7df)" filter="url(#shadow-74f7df)" />
                                </svg>

                                <span>ALM Pools</span>
                            </Button>
                        )}
                        <Button
                            onClick={() => toggleFilter("isMyPool")}
                            variant={isFilterActive("isMyPool") ? "iconHover" : "outline"}
                            size="md"
                            className="flex h-12 min-w-[130px] items-center gap-2 whitespace-nowrap rounded-lg p-4"
                        >
                            <User className="text-primary-200" size={16} />
                            <span>My Pools</span>
                        </Button>
                        <Button
                            hidden={!(isFilterActive("isMyPool") || isFilterActive("hasActiveFarming") || isFilterActive("hasALM"))}
                            size="md"
                            onClick={() => {
                                setColumnFilters([]);
                                setActiveFilters({});
                            }}
                            className="flex h-12 w-fit items-center gap-2 whitespace-nowrap rounded-lg border border-light border-transparent p-4"
                            variant="outline"
                        >
                            <span>Reset</span>
                            <X size={18} />
                        </Button>
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
                        table.getRowModel().rows.map((row: any) => {
                            return (
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
};
export default PoolsTable;
