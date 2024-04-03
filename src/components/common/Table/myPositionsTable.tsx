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
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from './loadingState';
import { PositionsStatus } from '@/types/position-filter-status';

interface MyPositionsTableProps<TData, TValue> {
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

const MyPositionsTable = <TData, TValue>({
    columns,
    data,
    selectedRow,
    action,
    link,
    defaultSortingID,
    loading,
}: MyPositionsTableProps<TData, TValue>) => {
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
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    const activePositions = data.filter(
        (pos: any) => !pos.inFarming && !pos.isClosed
    );

    const farmingPositions = data.filter(
        (pos: any) => pos.inFarming && !pos.isClosed
    );

    const closedPositions = data.filter((pos: any) => pos.isClosed);

    const noActivePositions =
        filterStatus.Open && activePositions.length === 0;
    const noFarmingPositions =
        filterStatus.OnFarming && farmingPositions.length === 0;
    const noClosedPositions =
        filterStatus.Closed && closedPositions.length === 0;

    const renderHeaderRow = useCallback(
        (positionStatus: PositionsStatus) => {
            const isStatusActive = positionStatus === PositionsStatus.OPEN;
            const isStatusOnFarming =
                positionStatus === PositionsStatus.ON_FARMING;
            const isStatusClosed = positionStatus === PositionsStatus.CLOSED;
            return (
                <TableRow
                    key={'open-positions'}
                    className="hover:bg-transparent h-full cursor-pointer"
                    onClick={() => {
                        if (isStatusActive) setExpandActive(!expandActive);
                        if (isStatusOnFarming)
                            setExpandOnFarming(!expandOnFarming);
                        if (isStatusClosed) setExpandClosed(!expandClosed);
                    }}
                >
                    <td
                        colSpan={columns.length}
                        className="pl-8 h-12 text-left whitespace-nowrap"
                    >
                        <span className="flex gap-4 items-center">
                            {isStatusActive && 'Open'}
                            {isStatusOnFarming && 'On Farming'}
                            {isStatusClosed && 'Closed'}
                            <ChevronDown
                                className={cn(
                                    'opacity-50 transition-transform ease-in-out duration-200 mt-auto',
                                    isStatusActive &&
                                        !expandActive &&
                                        '-rotate-90 opacity-100',
                                    isStatusOnFarming &&
                                        !expandOnFarming &&
                                        '-rotate-90 opacity-100',
                                    isStatusClosed &&
                                        !expandClosed &&
                                        '-rotate-90 opacity-100'
                                )}
                                size={18}
                            />
                        </span>
                    </td>
                </TableRow>
            );
        },
        [expandActive, expandOnFarming, expandClosed, columns.length]
    );

    const renderPositions = useCallback(
        (positionStatus: PositionsStatus) => {
            const isStatusActive = positionStatus === PositionsStatus.OPEN;
            const isStatusOnFarming =
                positionStatus === PositionsStatus.ON_FARMING;
            const isStatusClosed = positionStatus === PositionsStatus.CLOSED;

            return table.getRowModel().rows.map((row: any) => {
                const isSelected =
                    Number(selectedRow) === Number(row.original.id);
                if (
                    (isStatusActive &&
                        !row.original.inFarming &&
                        !row.original.isClosed) ||
                    (isStatusOnFarming &&
                        row.original.inFarming &&
                        !row.original.isClosed) ||
                    (isStatusClosed && row.original.isClosed)
                ) {
                    return (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                            className={`border-card-border/40 ${
                                isSelected
                                    ? 'bg-muted-primary/60'
                                    : 'bg-card-dark'
                            } ${(action || link) && 'cursor-pointer'} ${
                                action || link
                                    ? isSelected
                                        ? 'hover:bg-muted-primary'
                                        : 'hover:bg-card-hover'
                                    : 'hover:bg-card-dark'
                            } ${
                                isStatusActive &&
                                !expandActive &&
                                'collapse border-0 opacity-0'
                            } ${
                                isStatusOnFarming &&
                                !expandOnFarming &&
                                'collapse border-0 opacity-0'
                            }
                            ${
                                isStatusClosed &&
                                !expandClosed &&
                                'collapse border-0 opacity-0'
                            }`}
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
                } else return null;
            });
        },
        [
            action,
            link,
            expandActive,
            expandOnFarming,
            expandClosed,
            selectedRow,
            table,
            navigate,
        ]
    );

    if (loading) return <LoadingState />;

    return (
        <>
            <Table>
                <TableHeader className="[&_tr]:border-b [&_tr]:border-opacity-30">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="hover:bg-transparent"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    className="rounded-xl text-white font-semibold [&_svg]:mt-auto"
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
                <TableBody className="[&_tr]:border-opacity-30 hover:bg-transparent text-[16px]">
                    {table.getRowModel().rows?.length === 0 ||
                    (!filterStatus.Open &&
                        !filterStatus.Closed &&
                        !filterStatus.OnFarming) ||
                    (noActivePositions &&
                        noFarmingPositions &&
                        !filterStatus.Closed) ||
                    (noActivePositions &&
                        noClosedPositions &&
                        !filterStatus.OnFarming) ||
                    (noActivePositions &&
                        !filterStatus.Closed &&
                        !filterStatus.OnFarming) ||
                    (noFarmingPositions &&
                        noClosedPositions &&
                        !filterStatus.Open) ||
                    (noFarmingPositions &&
                        !filterStatus.Open &&
                        !filterStatus.Closed) ||
                    (noClosedPositions &&
                        !filterStatus.Open &&
                        !filterStatus.OnFarming) ? (
                        <TableRow className="hover:bg-card h-full border-0">
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
                                filterStatus.Open && (
                                    <>
                                        {renderHeaderRow(
                                            PositionsStatus.OPEN
                                        )}
                                        {renderPositions(
                                            PositionsStatus.OPEN
                                        )}
                                    </>
                                )}

                            {farmingPositions.length > 0 &&
                                filterStatus.OnFarming && (
                                    <>
                                        {renderHeaderRow(
                                            PositionsStatus.ON_FARMING
                                        )}
                                        {renderPositions(
                                            PositionsStatus.ON_FARMING
                                        )}
                                    </>
                                )}
                            {closedPositions.length > 0 &&
                                filterStatus.Closed && (
                                    <>
                                        {renderHeaderRow(
                                            PositionsStatus.CLOSED
                                        )}
                                        {renderPositions(
                                            PositionsStatus.CLOSED
                                        )}
                                    </>
                                )}
                        </>
                    )}
                </TableBody>
            </Table>
        </>
    );
};

export default MyPositionsTable;
