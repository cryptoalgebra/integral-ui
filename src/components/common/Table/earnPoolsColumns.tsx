import { HeaderItem } from "@/components/common/Table/common";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import CreatePositionModal from "@/components/modals/CreatePositionModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlockExplorerURL } from "@/hooks/common/useBlockExplorer";
import { formatAmount } from "@/utils/common/formatAmount";
import { truncateHash } from "@/utils/common/truncateHash";
import { ColumnDef } from "@tanstack/react-table";
import { Address } from "viem";
import { ExtendedPosition } from "@/hooks/earn/useExtendedPositions";

const EarnPoolPair = ({ extendedPosition }: { extendedPosition: ExtendedPosition }) => {
    const { pool } = extendedPosition;
    const { token0, token1 } = pool.pool;

    return (
        <div className="ml-1.5 flex items-center gap-3">
            <div className="flex shrink-0 items-center">
                <CurrencyLogo currency={token0} size={32} className="ring-2 ring-card" />
                <CurrencyLogo currency={token1} size={32} className="-ml-2 ring-2 ring-card" />
            </div>

            {token0 && token1 ? (
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-text">{`${token0.symbol} / ${token1.symbol}`}</span>
                </div>
            ) : (
                <Skeleton className="h-5 w-24 rounded-lg bg-panel" />
            )}
        </div>
    );
};

const EarnRowAction = ({ extendedPosition }: { extendedPosition: ExtendedPosition }) => {
    const { pool } = extendedPosition;
    const { token0, token1 } = pool.pool;

    const poolAddress = pool.id as Address;

    // if (pool.hasManageablePosition) {
    //     return (
    //         <ManagePositionModal
    //             poolAddress={poolAddress}
    //             poolLabel={`${pool.pair.token0.symbol} / ${pool.pair.token1.symbol}`}
    //             positionIds={pool.positionIds}
    //         >
    //             <Button size="sm" variant="outline" className="whitespace-nowrap">
    //                 Manage
    //             </Button>
    //         </ManagePositionModal>
    //     );
    // }

    return (
        <CreatePositionModal poolAddress={poolAddress} fee={pool.pool.fee} token0={token0} token1={token1}>
            <Button size="sm" variant="primaryLink" className="whitespace-nowrap">
                Deposit
            </Button>
        </CreatePositionModal>
    );
};

export const earnPoolsColumns: ColumnDef<ExtendedPosition>[] = [
    {
        accessorKey: "pair",
        header: () => <HeaderItem className="ml-2">Pool</HeaderItem>,
        cell: ({ row }) => <EarnPoolPair extendedPosition={row.original} />,
        filterFn: (row, _, value) =>
            [
                row.original.pool.pool.token0.symbol,
                row.original.pool.pool.token1.symbol,
                row.original.pool.pool.token0.name,
                row.original.pool.pool.token1.name,
            ]
                .join(" ")
                .toLowerCase()
                .includes(value),
    },
    {
        accessorKey: "tvlUSD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                TVL
            </HeaderItem>
        ),
        cell: ({ row }) => `$${formatAmount(row.original.pool.tvlUSD, 4)}`,
    },
    {
        accessorKey: "apr",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                APR
            </HeaderItem>
        ),
        cell: ({ row }) => `${formatAmount(row.original.pool.apr, 2)}%`,
    },
    {
        accessorKey: "amountUSD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Your Stake
            </HeaderItem>
        ),
        cell: ({ getValue }) => `$${formatAmount(getValue() as number, 4)}`,
    },
    {
        accessorKey: "feesUSD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Your Rewards
            </HeaderItem>
        ),
        cell: ({ row }) => (
            <div className="flex min-w-[220px] items-center justify-between gap-3">
                <span className="font-medium text-text">${formatAmount(row.original.feesUSD, 4)}</span>
                <EarnRowAction extendedPosition={row.original} />
            </div>
        ),
    },
];
