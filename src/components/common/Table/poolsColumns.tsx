import { ColumnDef } from "@tanstack/react-table";
import { HeaderItem } from "./common";
import { Address } from "viem";
import CurrencyLogo from "../CurrencyLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/common/useCurrency";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatAmount } from "@/utils/common/formatAmount";
import { customPoolDeployerTitleByAddress } from "config/custom-pool-deployer";
import { FormattedPool } from "@/hooks/pools/useFormattedPools";
import { enabledModules } from "config/app-modules";

import ALMModule from "@/modules/ALMModule";
const { ALMTag } = ALMModule.components;

import FarmingModule from "@/modules/FarmingModule";
const { FarmTag } = FarmingModule.components;

import BoostedPoolsModule from "@/modules/BoostedPoolsModule";
const { BoostedTag, BoostedAPR } = BoostedPoolsModule.components;
const { useBoostedTokenAPR } = BoostedPoolsModule.hooks;

const PoolPair = ({ pair, id, hasALM, hasActiveFarming }: FormattedPool) => {
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

            <div className="flex items-center gap-2">
                {hasActiveFarming && <FarmTag poolAddress={id} />}
                {hasALM && <ALMTag poolAddress={id} />}
                <BoostedTag currencyA={currencyA} currencyB={currencyB} />
            </div>
            {/* <div className="bg-muted-primary text-primary-text rounded-xl px-2 py-1">{`${fee}%`}</div> */}
            {/* {hasALM ? <img className="w-6 h-6 overflow-hidden rounded-full" src={almLogo} alt="ALM" /> : null} */}
        </div>
    );
};

const AvgAPR = ({
    isBoostedToken0,
    isBoostedToken1,
    isBoostedPool,
    poolMaxApr,
    farmApr,
    pair,
    hasActiveFarming,
    avgApr,
}: FormattedPool) => {
    const { data: token0Apr } = useBoostedTokenAPR(isBoostedToken0 ? (pair.token0.id as Address) : undefined);
    const { data: token1Apr } = useBoostedTokenAPR(isBoostedToken1 ? (pair.token1.id as Address) : undefined);

    return (
        <div className="flex items-center gap-2">
            <HoverCard>
                <HoverCardTrigger>
                    <span>{`${formatAmount(avgApr, 2)}%`}</span>
                </HoverCardTrigger>
                <HoverCardContent>
                    <p>Avg. APR - {avgApr}</p>
                    {hasActiveFarming ? <p>{`Farm APR - ${formatAmount(farmApr, 2)}%`}</p> : undefined}
                    <p>Max APR - {`${formatAmount(poolMaxApr, 2)}%`}</p>
                </HoverCardContent>
            </HoverCard>
            {isBoostedPool && (
                <BoostedAPR
                    token0Apr={token0Apr}
                    token1Apr={token1Apr}
                    token0Name={pair.token0.name}
                    token1Name={pair.token1.name}
                    baseAPR={avgApr}
                />
            )}
        </div>
    );
};

export const poolsColumns: ColumnDef<FormattedPool>[] = ([
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
    enabledModules.CustomPoolsModule && {
        accessorKey: "deployer",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Deployer
            </HeaderItem>
        ),
        cell: ({ row }) => customPoolDeployerTitleByAddress[row.original.deployer.toLowerCase() as Address],
    },
    {
        accessorKey: "tvlUSD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                TVL
            </HeaderItem>
        ),
        cell: ({ getValue }) => `$${formatAmount(getValue() as number, 2)}`,
    },
    {
        accessorKey: "volume24USD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Volume 24H
            </HeaderItem>
        ),
        cell: ({ getValue }) => `$${formatAmount(getValue() as number, 2)}`,
    },
    {
        accessorKey: "fees24USD",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Fees 24H
            </HeaderItem>
        ),
        cell: ({ getValue }) => `$${formatAmount(getValue() as number, 2)}`,
    },
    {
        accessorKey: "avgApr",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Avg. APR
            </HeaderItem>
        ),
        cell: ({ row }) => <AvgAPR {...row.original} />,
        filterFn: (v, _, value: boolean) => v.original.hasActiveFarming === value,
    },
] as (ColumnDef<FormattedPool> | false)[]).filter((col): col is ColumnDef<FormattedPool> => Boolean(col));
