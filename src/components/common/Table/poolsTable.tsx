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
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "./loadingState";
import { Input } from "@/components/ui/input";
import { Search, Tractor } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
        globalFilterFn: (row: any) => row.original.isMyPool === true,
    });

    const isMyPools: boolean | undefined = table.getState().globalFilter;

    const searchID = "pair";

    if (loading) return <LoadingState />;

    return (
        <>
            {searchID && (
                <div className="flex gap-4 w-full justify-between items-center p-4 pb-0">
                    <div className="flex items-center relative w-fit">
                        <Input
                            placeholder="Search"
                            value={(table.getColumn(searchID)?.getFilterValue() as string) ?? ""}
                            onChange={(event) => table.getColumn(searchID)?.setFilterValue(event.target.value)}
                            className="border border-border border-opacity-60 pl-12 h-12 max-w-80 md:w-64 lg:w-80 focus:border-opacity-100 rounded-xl"
                        />
                        <Search className="absolute left-4 text-border" size={20} />
                    </div>
                    <ul className="flex gap-1 p-1 border rounded-xl border-border/60 w-fit h-12 max-xs:hidden">
                        <li>
                            <Button
                                onClick={() => table.setGlobalFilter(undefined)}
                                className="rounded-lg h-full p-4 w-fit flex-nowrap"
                                size="md"
                                variant={!isMyPools ? "iconActive" : "ghost"}
                            >
                                All
                            </Button>
                        </li>
                        <li>
                            <Button
                                onClick={() => table.setGlobalFilter(true)}
                                className="rounded-lg h-full p-4 w-fit whitespace-nowrap"
                                size="md"
                                variant={isMyPools ? "iconActive" : "ghost"}
                            >
                                My pools
                            </Button>
                        </li>
                    </ul>
                    <div className="flex gap-2 max-md:gap-4 items-center w-fit ml-auto max-sm:hidden">
                        <label className="flex gap-2 items-center" htmlFor="farmingAvailable">
                            <Tractor className="w-5 h-5 max-md:w-6 max-md:h-6" color="#d84eff" />
                            <span className="max-md:hidden">Farming Available</span>
                        </label>
                        <Switch
                            id="farmingAvailable"
                            checked={table.getColumn("plugins")?.getFilterValue() === true}
                            onCheckedChange={() => {
                                const column = table.getColumn("plugins");
                                if (column?.getFilterValue() === undefined) column?.setFilterValue(true);
                                else column?.setFilterValue(undefined);
                            }}
                        />
                    </div>
                </div>
            )}
            <Table>
                <TableHeader className="[&_tr]:border-b [&_tr]:border-opacity-30 border-t border-opacity-60">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent">
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className="rounded-xl text-white font-semibold [&_svg]:mt-auto">
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
                                        <TableCell key={cell.id} className="text-left min-w-[120px] first:min-w-[320px]">
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
