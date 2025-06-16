import { ColumnDef } from "@tanstack/react-table";
import { HeaderItem } from "./common";
import { Address } from "wagmi";
import CurrencyLogo from "../CurrencyLogo";
import { TokenFieldsFragment } from "@/graphql/generated/graphql";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/common/useCurrency";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ReactNode } from "react";
import { customPoolDeployerTitles } from "@/constants/deployers.ts";
import { formatAmount } from "@/utils/common/formatAmount";

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
    deployer: string;
}

const PoolPair = ({ pair }: Pool) => {
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

            {/* <div className="bg-muted-primary text-primary-text rounded-xl px-2 py-1">{`${fee}%`}</div> */}
            {/* {hasALM ? <img className="w-6 h-6 overflow-hidden rounded-full" src={almLogo} alt="ALM" /> : null} */}
        </div>
    );
};

const AvgAPR = ({
    children,
    avgApr,
    farmApr,
    maxApr,
}: {
    children: ReactNode;
    avgApr: string;
    farmApr: string | undefined;
    maxApr: string;
}) => {
    return (
        <HoverCard>
            <HoverCardTrigger>{children}</HoverCardTrigger>
            <HoverCardContent className="text-black">
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
        accessorKey: "deployer",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Deployer
            </HeaderItem>
        ),
        cell: ({ row }) => customPoolDeployerTitles[row.original.deployer],
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
        cell: ({ getValue, row }) => {
            return (
                <AvgAPR
                    avgApr={`${formatAmount(row.original.poolAvgApr, 2)}%`}
                    maxApr={`${formatAmount(row.original.poolMaxApr, 2)}%`}
                    farmApr={row.original.hasActiveFarming ? `${formatAmount(row.original.farmApr, 2)}%` : undefined}
                >
                    {`${formatAmount(getValue() as number, 2)}%`}
                </AvgAPR>
            );
        },
    },
];
