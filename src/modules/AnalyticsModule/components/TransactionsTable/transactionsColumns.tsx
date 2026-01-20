import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { truncateHash } from "@/utils/common/truncateHash";
import { HeaderItem } from "@/components/common/Table/common";
import { formatAmount } from "@/utils";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useCurrency } from "@/hooks/common/useCurrency";
import { Address } from "viem";
import { formatDate } from "@/utils/common/formatDate";

interface IPoolPair {
    address: string;
    token0: {
        symbol: string;
        address: string;
        decimals: number;
    };
    token1: {
        symbol: string;
        address: string;
        decimals: number;
    };
}

export interface TX {
    now: Date;
    time: Date;
    hash: string;
    pool: IPoolPair;
    __typename: string;
    amount0: number;
    amount1: number;
    wallet: string;
    zeroToOne: boolean;
}

function Time({ time, now }: TX) {
    return (
        <div className="flex flex-col items-start gap-1">
            <p className="opacity-50 sm:hidden">Time</p>
            <span>{formatDate(time, now)}</span>
        </div>
    );
}

function PoolPair({ pool }: TX) {
    const tokenA = useCurrency(pool.token0.address as Address);
    const tokenB = useCurrency(pool.token1.address as Address);

    if (!tokenA || !tokenB) return null;

    return (
        <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex">
                <CurrencyLogo currency={tokenA} size={30} />
                <CurrencyLogo className="-ml-2" currency={tokenB} size={30} />
            </div>
            <div>{`${tokenA.symbol} - ${tokenB.symbol}`}</div>
        </div>
    );
}

function Amount({ pool, amount0, amount1, isFirst, zeroToOne, __typename }: TX & { isFirst: boolean }) {
    const { tokenAddress, amount } = useMemo(() => {
        switch (isFirst) {
            case true:
                return {
                    tokenAddress: zeroToOne ? pool.token0.address : pool.token1.address,
                    amount: zeroToOne ? amount0 : amount1,
                };

            case false:
                return {
                    tokenAddress: zeroToOne ? pool.token1.address : pool.token0.address,
                    amount: zeroToOne ? amount1 : amount0,
                };

            default:
                return {
                    tokenAddress: zeroToOne ? pool.token0.address : pool.token1.address,
                    amount: zeroToOne ? amount0 : amount1,
                };
        }
    }, [isFirst, zeroToOne, pool.token0.address, pool.token1.address, amount0, amount1]);

    const jetton = useCurrency(tokenAddress as Address);

    if (!jetton) return undefined;

    return (
        <div className="relative flex items-center justify-start gap-2">
            <CurrencyLogo currency={jetton} size={30} />
            <span>{formatAmount(amount)}</span>
            {isFirst && __typename === "Swap" ? (
                <ArrowRight className="absolute left-[130px] max-sm:left-[110px]" size={18} />
            ) : isFirst && (__typename === "Mint" || __typename === "Burn" || __typename === "Collect") ? (
                <Plus className="absolute left-[130px] max-sm:left-[110px]" size={18} />
            ) : null}
        </div>
    );
}

export const transactionsColumns: ColumnDef<TX>[] = [
    {
        accessorKey: "time",
        header: ({ column }) => (
            <HeaderItem
                sort={() => column.toggleSorting(column.getIsSorted() === "asc")}
                isAsc={column.getIsSorted() === "asc"}
                className="ml-2"
            >
                Time
            </HeaderItem>
        ),
        cell: ({ row }) => <Time {...row.original} />,
        filterFn: (v, _, value) =>
            [v.original.time]
                .join(" ")
                .toLowerCase()
                .includes(value),
        sortingFn: (rowA, rowB) => new Date(rowA.original.time).getTime() - new Date(rowB.original.time).getTime(),
    },
    {
        accessorKey: "pool",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Pool
            </HeaderItem>
        ),
        cell: ({ row }) => <PoolPair {...row.original} />,
    },
    {
        accessorKey: "__typename",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Type
            </HeaderItem>
        ),
        filterFn: (row, _, values) => (Array.isArray(values) ? values.includes(row.original.__typename) : false),
        cell: ({ row }) => (
            <div className="flex flex-col items-start gap-1">
                <p className="opacity-50 sm:hidden">Type</p>
                <span>{row.original.__typename}</span>
            </div>
        ),
    },
    {
        accessorKey: "amount0",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Token Amount
            </HeaderItem>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col items-start gap-1">
                <p className="opacity-50 sm:hidden">Amount</p>
                <Amount {...row.original} isFirst />
            </div>
        ),
    },
    {
        accessorKey: "amount1",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Token Amount
            </HeaderItem>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col items-start gap-1">
                <p className="opacity-50 sm:hidden">Amount</p>
                <Amount {...row.original} isFirst={false} />
            </div>
        ),
    },
    {
        accessorKey: "wallet",
        header: ({ column }) => (
            <HeaderItem sort={() => column.toggleSorting(column.getIsSorted() === "asc")} isAsc={column.getIsSorted() === "asc"}>
                Wallet
            </HeaderItem>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col items-start gap-1">
                <p className="opacity-50 sm:hidden">Wallet</p>
                <span className="max-w-[150px] overflow-hidden truncate">{truncateHash(row.original.wallet as Address)}</span>
            </div>
        ),
    },
];
