import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    ColumnDef,
    OnChangeFn,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { LoadingState } from "./loadingState";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, User, X, Zap } from "lucide-react";
import { enabledModules } from "config/app-modules";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils";

type ActiveFilters = {
    hasActiveFarming?: boolean;
    hasALM?: boolean;
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

const SHOWCASE_SORT_ID = "__showcasePriority";

const PoolsTable = <TData, TValue>({
    columns,
    data,
    action,
    link,
    defaultSortingID,
    showPagination = true,
    loading,
}: PoolsTableProps<TData, TValue>) => {
    const [sorting, setSorting] = useState<SortingState>(() => {
        const defaultSort = defaultSortingID ? [{ id: defaultSortingID, desc: true }] : [];
        return [{ id: SHOWCASE_SORT_ID, desc: true }, ...defaultSort];
    });

    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
    const columnsWithShowcaseSort = useMemo(
        () => [
            ...columns,
            {
                id: SHOWCASE_SORT_ID,
                accessorFn: (row: any) => (row?.isShowcase ? 1 : 0),
                header: () => null,
                cell: () => null,
            } as ColumnDef<TData, TValue>,
        ],
        [columns],
    );

    const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
        setSorting((prev) => {
            const next = typeof updater === "function" ? updater(prev) : updater;
            const withoutShowcase = next.filter((s) => s.id !== SHOWCASE_SORT_ID);
            return [{ id: SHOWCASE_SORT_ID, desc: true }, ...withoutShowcase];
        });
    };

    const table = useReactTable({
        data,
        columns: columnsWithShowcaseSort,
        initialState: {
            columnVisibility: {
                [SHOWCASE_SORT_ID]: false,
            },
        },
        state: {
            columnFilters,
            sorting,
            globalFilter: activeFilters,
        },
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: handleSortingChange,
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

    const hasScopedFilters =
        isFilterActive("isMyPool") || isFilterActive("hasActiveFarming") || isFilterActive("hasALM") || isFilterActive("isBoosted");

    const hasSearch = columnFilters.length > 0;

    const hasActiveSelections = hasSearch || hasScopedFilters;

    if (loading) return <LoadingState />;

    return (
        <>
            {searchID && (
                <div className="flex flex-col gap-4 ">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
                            <div className="relative w-full lg:max-w-sm">
                                <Input
                                    placeholder="Search pools..."
                                    value={(table.getColumn(searchID)?.getFilterValue() as string) ?? ""}
                                    onChange={(event) => table.getColumn(searchID)?.setFilterValue(event.target.value)}
                                    className="pl-9"
                                />
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    onClick={() => setActiveFilters({})}
                                    variant={!hasScopedFilters ? "ghostActive" : "outline"}
                                    size="md"
                                >
                                    All Pools
                                </Button>

                                <Button
                                    onClick={() => toggleFilter("isMyPool")}
                                    variant={isFilterActive("isMyPool") ? "ghostActive" : "outline"}
                                    size="md"
                                >
                                    <User className="size-4 text-primary" />
                                    <span>My Pools</span>
                                </Button>

                                {enabledModules.FarmingModule && (
                                    <Button
                                        onClick={() => toggleFilter("hasActiveFarming")}
                                        variant={isFilterActive("hasActiveFarming") ? "ghostActive" : "outline"}
                                        size="md"
                                    >
                                        <span className="h-2.5 w-2.5 rounded-md bg-primary" />
                                        <span>Farm</span>
                                    </Button>
                                )}

                                {enabledModules.ALMModule && (
                                    <Button
                                        onClick={() => toggleFilter("hasALM")}
                                        variant={isFilterActive("hasALM") ? "ghostActive" : "outline"}
                                        size="md"
                                    >
                                        <span className="h-2.5 w-2.5 rounded-md bg-accent" />
                                        <span>ALM</span>
                                    </Button>
                                )}

                                {enabledModules.BoostedPoolsModule && (
                                    <Button
                                        onClick={() => toggleFilter("isBoosted")}
                                        variant={isFilterActive("isBoosted") ? "ghostActive" : "outline"}
                                        size="md"
                                    >
                                        <Zap className="size-4 text-accent" />
                                        <span>Boosted</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 text-sm text-text-muted xl:justify-end">
                            {hasActiveSelections && (
                                <Button
                                    size="md"
                                    onClick={() => {
                                        setColumnFilters([]);
                                        setActiveFilters({});
                                    }}
                                    variant="outline"
                                >
                                    <X size={14} />
                                    <span>Reset</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className="">
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
                                        <p className="text-base font-medium text-text">No pools match the current view.</p>
                                        <p className="text-sm text-text-muted">
                                            Adjust the search term or clear filters to widen the market set.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row: any) => {
                                return (
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
                                        {row.getVisibleCells().map((cell: any) => (
                                            <TableCell key={cell.id} className="min-w-32 px-4 py-3.5 text-left first:min-w-56">
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
};
export default PoolsTable;
