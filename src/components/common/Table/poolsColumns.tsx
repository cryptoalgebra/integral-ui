import { ColumnDef } from "@tanstack/react-table";
import { HeaderItem } from "./common";
import { Address } from "wagmi";
import CurrencyLogo from "../CurrencyLogo";
import { TokenFieldsFragment } from "@/graphql/generated/graphql";
import { DynamicFeePluginIcon } from "../PluginIcons";
import { formatUSD } from "@/utils/common/formatUSD";
import { usePoolPlugins } from "@/hooks/pools/usePoolPlugins";
import { Skeleton } from "@/components/ui/skeleton";
import { FarmingPluginIcon } from "../PluginIcons";
import { useCurrency } from "@/hooks/common/useCurrency";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatPercent } from "@/utils/common/formatPercent";
import { ReactNode } from "react";

interface Pair {
    token0: TokenFieldsFragment;
    token1: TokenFieldsFragment;
}

interface Pool {
    id: Address;
    pair: Pair;
    fee: number;
    tvlUSD: number;
    volume24USD: number;
    poolMaxApr: number;
    poolAvgApr: number;
    avgApr: number;
    farmApr: number;
    isMyPool: boolean;
    hasActiveFarming: boolean;
}

const PoolPair = ({ pair, fee }: Pool) => {
    const token0 = pair.token0.id as Address;
    const token1 = pair.token1.id as Address;

    const currencyA = useCurrency(token0, true);
    const currencyB = useCurrency(token1, true);

    return (
        <div className="flex items-center gap-4 ml-2">
            <div className="flex">
                <CurrencyLogo currency={currencyA} size={30} />
                <CurrencyLogo currency={currencyB} size={30} className="-ml-2" />
            </div>

            {currencyA && currencyB ? (
                <div>{`${currencyA?.symbol} - ${currencyB?.symbol}`}</div>
            ) : (
                <Skeleton className="h-[20px] w-[90px] bg-card" />
            )}

            <div className="bg-muted-primary text-primary-text rounded-xl px-2 py-1">{`${fee}%`}</div>
        </div>
    );
};

const Plugins = ({ poolId }: { poolId: Address }) => {
    const { dynamicFeePlugin, farmingPlugin } = usePoolPlugins(poolId);

    return (
        <div className="flex gap-2">
            {dynamicFeePlugin && <DynamicFeePluginIcon />}
            {farmingPlugin && <FarmingPluginIcon />}
        </div>
    );
};

const AvgAPR = ({ children, avgApr, farmApr, maxApr }: { children: ReactNode; avgApr: string; farmApr: string | undefined; maxApr: string }) => {
    return (
        <HoverCard>
            <HoverCardTrigger>{children}</HoverCardTrigger>
            <HoverCardContent>
                <p>Avg. APR - {avgApr}</p>
                {farmApr && <p>Farm APR - {farmApr}</p>}
                <p>Max APR - {maxApr}</p>
            </HoverCardContent>
        </HoverCard>
    );
};

export const poolsColumns: ColumnDef<Pool>[] = [
    {
        accessorKey: "pair",
        header: () => <HeaderItem className="ml-2">Pool</HeaderItem>,
        cell: ({ row }) => <PoolPair {...row.original} />,
        filterFn: (v, _, value) =>
            [v.original.pair.token0.symbol, v.original.pair.token1.symbol, v.original.pair.token0.name, v.original.pair.token1.name]
                .join(" ")
                .toLowerCase()
                .includes(value),
    },
    {
        accessorKey: "plugins",
        header: () => <HeaderItem>Plugins</HeaderItem>,
        cell: ({ row }) => <Plugins poolId={row.original.id} />,
        filterFn: (v, _, value: boolean) => v.original.hasActiveFarming === value,
    },
    {
        accessorKey: "tvlUSD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                TVL
            </HeaderItem>
        ),
        cell: ({ getValue }) => formatUSD.format(getValue() as number),
    },
    {
        accessorKey: "volume24USD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Volume 24H
            </HeaderItem>
        ),
        cell: ({ getValue }) => formatUSD.format(getValue() as number),
    },
    {
        accessorKey: "fees24USD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Fees 24H
            </HeaderItem>
        ),
        cell: ({ getValue }) => formatUSD.format(getValue() as number),
    },
    {
        accessorKey: "avgApr",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Avg. APR
            </HeaderItem>
        ),
        cell: ({ getValue, row }) => {
            return (
                <AvgAPR
                    avgApr={formatPercent.format(row.original.poolAvgApr)}
                    maxApr={formatPercent.format(row.original.poolMaxApr)}
                    farmApr={row.original.hasActiveFarming && formatPercent.format(row.original.farmApr)}
                >
                    {formatPercent.format(getValue() as number)}
                </AvgAPR>
            );
        },
    },
];
