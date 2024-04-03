import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { usePositionFilterStore } from '@/state/positionFilterStore';
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
} from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    selectedRow?: number;
    action?: (args?: any) => void;
    defaultSortingID?: string;
    link?: string;
    showPagination?: boolean;
    searchID?: string;
    loading?: boolean;
}

const DataTable = <TData, TValue>({
    columns,
    data,
    selectedRow,
    action,
    link,
    defaultSortingID,
    showPagination = true,
    loading,
}: DataTableProps<TData, TValue>) => {
    const [sorting, setSorting] = useState<SortingState>(
        defaultSortingID ? [{ id: defaultSortingID, desc: true }] : []
    );
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [expandActive, setExpandActive] = useState(true);
    const [expandOnFarming, setExpandOnFarming] = useState(true);
    const [expandClosed, setExpandClosed] = useState(true);

    const { filterStatus } = usePositionFilterStore();

    const navigate = useNavigate();

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: showPagination
            ? getPaginationRowModel()
            : undefined,
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        autoResetPageIndex: true,
    });

    const activePositions = data.filter(
        (pos: any) => !pos.inFarming && !pos.isClosed && !pos.pair // TODO
    );

    const farmingPositions = data.filter((pos: any) => pos.inFarming);

    const zeroLiquidityPositions = data.filter(
        (pos: any) => pos.isClosed
    );

    const renderFarmingPositions = useCallback(() => {
        return table.getRowModel().rows.map((row: any) => {
            const isSelected = Number(selectedRow) === Number(row.original.id);
            if (!row.original.isClosed && row.original.inFarming)
                return (
                    <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className={`border-card-border/40 ${
                            isSelected ? 'bg-muted-primary/60' : 'bg-card-dark'
                        } ${(action || link) && 'cursor-pointer'} ${
                            action || link
                                ? isSelected
                                    ? 'hover:bg-muted-primary'
                                    : 'hover:bg-card-hover'
                                : 'hover:bg-card-dark'
                        } ${!expandOnFarming && 'collapse border-0 opacity-0'}`}
                        onClick={() => {
                            if (action) {
                                action(row.original.id);
                            } else if (link) {
                                navigate(`/${link}/${row.original.id}`);
                            }
                        }}
                    >
                        {row.getVisibleCells().map((cell: any) => (
                            <TableCell key={cell.id} className="text-left">
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                );
        });
    }, [farmingPositions]);

    const renderZeroLiquidityPositions = useCallback(() => {
        return table.getRowModel().rows.map((row: any) => {
            const isSelected = Number(selectedRow) === Number(row.original.id);
            if (row.original.isClosed)
                return (
                    <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className={`border-card-border/40 ${
                            isSelected ? 'bg-muted-primary/60' : 'bg-card-dark'
                        } ${(action || link) && 'cursor-pointer'} ${
                            action || link
                                ? isSelected
                                    ? 'hover:bg-muted-primary'
                                    : 'hover:bg-card-hover'
                                : 'hover:bg-card-dark'
                        } ${!expandClosed && 'collapse border-0 opacity-0'}`}
                        onClick={() => {
                            if (action) {
                                action(row.original.id);
                            } else if (link) {
                                navigate(`/${link}/${row.original.id}`);
                            }
                        }}
                    >
                        {row.getVisibleCells().map((cell: any) => (
                            <TableCell key={cell.id} className="text-left">
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </TableCell>
                        ))}
                    </TableRow>
                );
        });
    }, [zeroLiquidityPositions]);

    if (loading) return <LoadingState />;

    return (
        <>
            <Table>
                <TableHeader className="[&_tr]:border-b-0">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="hover:bg-transparent"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className="rounded-xl text-white font-semibold"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody className="hover:bg-transparent text-[16px]">
                    {table.getRowModel().rows?.length === 0 ||
                    (!filterStatus.Active &&
                        !filterStatus.Closed &&
                        !filterStatus.OnFarming) ? (
                        <TableRow className="hover:bg-card h-full">
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No results.
                            </TableCell>
                        </TableRow>
                    ) : (
                        <>
                            {activePositions.length > 0 &&
                                filterStatus.Active === true && (
                                    <TableRow
                                        key={'active-positions'}
                                        className="hover:bg-transparent h-full cursor-pointer border-opacity-30 border-t"
                                        onClick={() => {
                                            setExpandActive(!expandActive);
                                        }}
                                    >
                                        <td
                                            colSpan={columns.length}
                                            className="pl-8 h-12 text-left whitespace-nowrap border-opacity-30 border-t border-b"
                                        >
                                            <span className="flex gap-4 items-center">
                                                Active
                                                <ChevronDown
                                                    className={cn(
                                                        'opacity-50 mt-auto',
                                                        !expandActive &&
                                                            '-rotate-90 opacity-100'
                                                    )}
                                                    size={18}
                                                />
                                            </span>
                                        </td>
                                    </TableRow>
                                )}
                            {filterStatus.Active === true &&
                                table.getRowModel().rows.map((row: any) => {
                                    const isSelected =
                                        Number(selectedRow) ===
                                        Number(row.original.id);
                                    if (!row.original.isClosed && !row.original.inFarming)
                                        return (
                                            <TableRow
                                                key={row.id}
                                                data-state={
                                                    row.getIsSelected() &&
                                                    'selected'
                                                }
                                                className={`border-card-border/40 ${
                                                    isSelected
                                                        ? 'bg-muted-primary/60'
                                                        : 'bg-card-dark'
                                                } ${
                                                    (action || link) &&
                                                    'cursor-pointer'
                                                } ${
                                                    action || link
                                                        ? isSelected
                                                            ? 'hover:bg-muted-primary'
                                                            : 'hover:bg-card-hover'
                                                        : 'hover:bg-card-dark'
                                                } ${!expandActive && 'border-0 opacity-0 collapse'}`}
                                                onClick={() => {
                                                    if (action) {
                                                        action(row.original.id);
                                                    } else if (link) {
                                                        navigate(
                                                            `/${link}/${row.original.id}`
                                                        );
                                                    }
                                                }}
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell: any) => (
                                                        <TableCell
                                                            key={cell.id}
                                                            className="text-left"
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext()
                                                            )}
                                                        </TableCell>
                                                    ))}
                                            </TableRow>
                                        );
                                })}

                            {farmingPositions.length > 0 &&
                                filterStatus.OnFarming && (
                                    <TableRow
                                        key={'farming-positions'}
                                        className="hover:bg-transparent h-full cursor-pointer border-opacity-30"
                                        onClick={() => {
                                            setExpandOnFarming(
                                                !expandOnFarming
                                            );
                                        }}
                                    >
                                        <td
                                            colSpan={columns.length}
                                            className="pl-8 h-12 text-left whitespace-nowrap border-opacity-30 border-t border-b"
                                        >
                                            <span className="flex gap-4 items-center">
                                                On Farming
                                                <ChevronDown
                                                    className={cn(
                                                        'opacity-50 transition-transform ease-in-out duration-200 mt-auto',
                                                        !expandOnFarming &&
                                                            '-rotate-90 opacity-100'
                                                    )}
                                                    size={18}
                                                />
                                            </span>
                                        </td>
                                    </TableRow>
                                )}
                            {farmingPositions.length > 0 &&
                                filterStatus.OnFarming &&
                                renderFarmingPositions()}

                            {zeroLiquidityPositions.length > 0 &&
                                filterStatus.Closed && (
                                    <TableRow
                                        key={'closed-positions'}
                                        className="hover:bg-transparent h-full cursor-pointer border-opacity-30 "
                                        onClick={() => {
                                            setExpandClosed(!expandClosed);
                                        }}
                                    >
                                        <td
                                            colSpan={columns.length}
                                            className="pl-8 h-12 text-left whitespace-nowrap border-opacity-30 border-b border-t"
                                        >
                                            <span className="flex gap-4 items-center">
                                                Closed
                                                <ChevronDown
                                                    className={cn(
                                                        'opacity-50 transition-transform ease-in-out duration-200 mt-auto',
                                                        !expandClosed &&
                                                            '-rotate-90 opacity-100'
                                                    )}
                                                    size={18}
                                                />
                                            </span>
                                        </td>
                                    </TableRow>
                                )}
                            {zeroLiquidityPositions.length > 0 &&
                                filterStatus.Closed &&
                                renderZeroLiquidityPositions()}
                        </>
                    )}
                </TableBody>
            </Table>
            {showPagination && (
                <div className="flex items-center justify-end space-x-2 px-4 mt-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            )}
        </>
    );
};

const LoadingState = () => (
    <div className="flex flex-col w-full gap-4 p-4">
        {[1, 2, 3, 4].map((v) => (
            <Skeleton
                key={`table-skeleton-${v}`}
                className="w-full h-[50px] bg-card-light rounded-xl"
            />
        ))}
    </div>
);

export default DataTable;
