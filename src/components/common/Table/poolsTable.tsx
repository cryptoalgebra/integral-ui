import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { LoadingState } from "./loadingState";
import { Input } from "@/components/ui/input";
import { Filter, Search, User, X } from "lucide-react";
import { enabledModules } from "config/app-modules";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

type ActiveFilters = {
    hasActiveFarming?: boolean;
    hasALM?: boolean;
    hasNAVHook?: boolean;
    hasKyc?: boolean;
    isMyPool?: boolean;
    isBoosted?: boolean;
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

// const SHOWCASE_SORT_ID = "__showcasePriority";

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
    // const columnsWithShowcaseSort = useMemo(
    //     () => [
    //         ...columns,
    //         {
    //             id: SHOWCASE_SORT_ID,
    //             accessorFn: (row: any) => (row?.isShowcase ? 1 : 0),
    //             header: () => null,
    //             cell: () => null,
    //         } as ColumnDef<TData, TValue>,
    //     ],
    //     [columns]
    // );

    // const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    //     setSorting((prev) => {
    //         const next = typeof updater === "function" ? updater(prev) : updater;
    //         const withoutShowcase = next.filter((s) => s.id !== SHOWCASE_SORT_ID);
    //         return [{ id: SHOWCASE_SORT_ID, desc: true }, ...withoutShowcase];
    //     });
    // };

    const table = useReactTable({
        data,
        columns,
        initialState: {
            // columnVisibility: {
            //     [SHOWCASE_SORT_ID]: false,
            // },
        },
        state: {
            columnFilters,
            sorting,
            globalFilter: activeFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setActiveFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,

        globalFilterFn: (row: any, _columnId, filterValue) => {
            const f = filterValue as ActiveFilters;
            if (f.hasActiveFarming && !row.original.hasActiveFarming) return false;
            if (f.hasALM && !row.original.hasALM) return false;
            if (f.hasNAVHook && !row.original.hasNAVHook) return false;
            if (f.hasKyc && !row.original.hasKyc) return false;
            if (f.isMyPool && !row.original.isMyPool) return false;
            if (f.isBoosted && !row.original.isBoosted) return false;
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

    const activePoolTypeFilters = [
        activeFilters.hasActiveFarming,
        activeFilters.hasALM,
        activeFilters.hasNAVHook,
        activeFilters.hasKyc,
        activeFilters.isBoosted,
    ].filter(Boolean).length;

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
                            className="border-none pl-12 h-10 max-w-80 md:w-64 lg:w-80 focus:border-opacity-100 focus:bg-primary-800 rounded-full bg-card-light"
                        />
                        <Search className="absolute left-4 text-border" size={20} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:flex w-full sm:w-fit">
                        <Button
                            onClick={() => toggleFilter("isMyPool")}
                            variant={isFilterActive("isMyPool") ? "iconActive" : "outline"}
                            size="md"
                            className="flex h-10 min-w-[130px] items-center gap-2 whitespace-nowrap rounded-full p-4"
                        >
                            <User className="text-primary-200" size={16} />
                            <span>My Pools</span>
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={activePoolTypeFilters ? "iconActive" : "outline"}
                                    size="md"
                                    className="flex h-10 min-w-10 items-center gap-2 whitespace-nowrap rounded-full p-4"
                                >
                                    <Filter size={16} />
                                    <span>Filters</span>
                                    {activePoolTypeFilters > 0 && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-200 px-1.5 text-xs font-semibold text-text-100">
                                            {activePoolTypeFilters}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" sideOffset={8} className="w-56 p-2">
                                <div className="flex flex-col gap-1">
                                    {enabledModules.FarmingModule && (
                                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text-200 transition-colors hover:bg-card-hover">
                                            <span className="flex items-center gap-3">
                                                <span className="h-2.5 w-2.5 rotate-45 border border-yellow-500 bg-yellow-950" />
                                                Farm
                                            </span>
                                            <Checkbox
                                                checked={isFilterActive("hasActiveFarming")}
                                                onCheckedChange={() => toggleFilter("hasActiveFarming")}
                                            />
                                        </label>
                                    )}
                                    {enabledModules.ALMModule && (
                                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text-200 transition-colors hover:bg-card-hover">
                                            <span className="flex items-center gap-3">
                                                <span className="h-2.5 w-2.5 rotate-45 border border-cyan-500 bg-cyan-950" />
                                                ALM
                                            </span>
                                            <Checkbox checked={isFilterActive("hasALM")} onCheckedChange={() => toggleFilter("hasALM")} />
                                        </label>
                                    )}
                                    {enabledModules.NAVHookModule && (
                                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text-200 transition-colors hover:bg-card-hover">
                                            <span className="flex items-center gap-3">
                                                <span className="h-2.5 w-2.5 rotate-45 border border-emerald-500 bg-emerald-950" />
                                                NAV
                                            </span>
                                            <Checkbox
                                                checked={isFilterActive("hasNAVHook")}
                                                onCheckedChange={() => toggleFilter("hasNAVHook")}
                                            />
                                        </label>
                                    )}
                                    {enabledModules.KYCModule && (
                                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text-200 transition-colors hover:bg-card-hover">
                                            <span className="flex items-center gap-3">
                                                <span className="h-2.5 w-2.5 rotate-45 border border-cyan-700 bg-cyan-950" />
                                                KYC
                                            </span>
                                            <Checkbox checked={isFilterActive("hasKyc")} onCheckedChange={() => toggleFilter("hasKyc")} />
                                        </label>
                                    )}
                                    {enabledModules.BoostedPoolsModule && (
                                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text-200 transition-colors hover:bg-card-hover">
                                            <span className="flex items-center gap-3">
                                                <span className="h-2.5 w-2.5 rotate-45 border border-purple-500 bg-purple-950" />
                                                Boosted
                                            </span>
                                            <Checkbox
                                                checked={isFilterActive("isBoosted")}
                                                onCheckedChange={() => toggleFilter("isBoosted")}
                                            />
                                        </label>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button
                        hidden={
                            !(
                                isFilterActive("isMyPool") ||
                                isFilterActive("hasActiveFarming") ||
                                isFilterActive("hasALM") ||
                                isFilterActive("hasNAVHook") ||
                                isFilterActive("hasKyc") ||
                                isFilterActive("isBoosted")
                            )
                        }
                        size="md"
                        onClick={() => {
                            setColumnFilters([]);
                            setActiveFilters({});
                        }}
                        className="flex h-10 w-fit ml-auto items-center gap-2 whitespace-nowrap rounded-full p-4"
                        variant="outline"
                    >
                        <X size={18} />
                        <span>Reset</span>
                    </Button>
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
                        <p className="mr-4">
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
