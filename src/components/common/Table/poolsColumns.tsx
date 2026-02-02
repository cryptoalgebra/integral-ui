import { ColumnDef } from "@tanstack/react-table";
import { HeaderItem } from "./common";
import { Address } from "viem";
import CurrencyLogo from "../CurrencyLogo";
import { TokenFieldsFragment } from "@/graphql/generated/graphql";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/common/useCurrency";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ReactNode } from "react";
import { formatAmount } from "@/utils/common/formatAmount";
import { customPoolDeployerTitleByAddress } from "config/custom-pool-deployer";

import { enabledModules } from "config/app-modules";

import ALMModule from "@/modules/ALMModule";
const { ALMTag } = ALMModule.components;

import FarmingModule from "@/modules/FarmingModule";
const { FarmTag } = FarmingModule.components;

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
    avgApr: number;
    isMyPool: boolean;
    hasActiveFarming: boolean;
    hasALM: boolean;
    deployer: string;
}

const PoolPair = ({ pair, id, hasALM, hasActiveFarming }: Pool) => {
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
            </div>
            {/* <div className="bg-muted-primary text-primary-text rounded-xl px-2 py-1">{`${fee}%`}</div> */}
            {/* {hasALM ? <img className="w-6 h-6 overflow-hidden rounded-full" src={almLogo} alt="ALM" /> : null} */}
        </div>
    );
};

const AvgAPR = ({
    children,
}: {
    children: ReactNode;
}) => {
    return (
        <HoverCard>
            <HoverCardTrigger>{children}</HoverCardTrigger>
        </HoverCard>
    );
};

export const poolsColumns: ColumnDef<Pool>[] = (
    [
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
        enabledModules.customPools && {
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
                    Daily Volume
                </HeaderItem>
            ),
            cell: ({ getValue }) => `$${formatAmount(getValue() as number, 2)}`,
        },
        {
            accessorKey: "fees24USD",
            header: ({ column }) => (
                <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                    Daily Fees
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
            cell: ({ getValue }) => {
                return (
                    <AvgAPR>
                        {`${formatAmount(getValue() as number, 2)}%`}
                    </AvgAPR>
                );
            },
            filterFn: (v, _, value: boolean) => v.original.hasActiveFarming === value,
        },
    ] as (ColumnDef<Pool> | false)[]
).filter((col): col is ColumnDef<Pool> => Boolean(col));
