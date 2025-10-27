import { useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { Skeleton } from "@/components/ui/skeleton";
import { useLimitOrdersListQuery, useMultiplePoolsQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { INITIAL_POOL_FEE, Pool, Position, TickMath, Token } from "@cryptoalgebra/custom-pools-sdk";
import { limitOrderColumns, LimitOrdersTable } from "../Table";
import { CUSTOM_POOL_DEPLOYER_ADDRESSES } from "config/custom-pool-deployer";
import { Button } from "@/components/ui/button";
import { BookOpen, History } from "lucide-react";
import { unwrappedToken } from "@/utils/common/unwrappedToken";

export const LimitOrdersList = () => {
    const { address: account } = useAccount();

    const chainId = useChainId();

    const [tab, setTab] = useState(0);

    const { limitOrderClient, infoClient } = useClients();

    const { data: limitOrders, loading: isLimitOrdersLoading } = useLimitOrdersListQuery({
        client: limitOrderClient,
        variables: {
            account,
        },
        pollInterval: 10_000,
    });

    const { data: poolForLimitOrders } = useMultiplePoolsQuery({
        variables: {
            poolIds: limitOrders && limitOrders.limitOrders.map(({ pool }: any) => pool),
        },
        client: infoClient,
    });

    const customPoolDeployer = CUSTOM_POOL_DEPLOYER_ADDRESSES.LIMIT_ORDERS[chainId];

    const formattedLimitOrders = useMemo(() => {
        if (!limitOrders || !poolForLimitOrders?.pools || !customPoolDeployer) return [];

        const pools: { [key: string]: Pool } = poolForLimitOrders.pools.reduce(
            (acc, { id, token0, token1, sqrtPrice, liquidity, tick, tickSpacing }) => ({
                ...acc,
                [id]: new Pool(
                    new Token(chainId, token0.id, Number(token0.decimals), token0.symbol, token0.name),
                    new Token(chainId, token1.id, Number(token1.decimals), token1.symbol, token1.name),
                    INITIAL_POOL_FEE,
                    sqrtPrice,
                    customPoolDeployer,
                    liquidity,
                    Number(tick),
                    Number(tickSpacing)
                ),
            }),
            {}
        );

        return limitOrders.limitOrders
            .map(
                ({
                    liquidity,
                    initialLiquidity,
                    killedLiquidity,
                    owner,
                    tickLower,
                    tickUpper,
                    zeroToOne,
                    epoch,
                    pool: poolId,
                    killed,
                    placeTimestamp,
                    closeTimestamp,
                }: any) => {
                    const pool = pools[poolId];

                    if (!pool) return null;

                    const liquidityForPosition = epoch.filled ? BigInt(initialLiquidity) - BigInt(killedLiquidity) : liquidity;

                    const positionLO = new Position({
                        pool,
                        liquidity: Number(liquidityForPosition),
                        tickLower: Number(tickLower),
                        tickUpper: Number(tickUpper),
                    });

                    const { token0PriceLower, token0PriceUpper } = positionLO;

                    const { amount0: amount0Max, amount1: amount1Max } = new Position({
                        pool: new Pool(
                            pool.token0,
                            pool.token1,
                            pool.fee,
                            zeroToOne ? TickMath.MAX_SQRT_RATIO : TickMath.MIN_SQRT_RATIO,
                            customPoolDeployer,
                            pool.liquidity,
                            zeroToOne ? TickMath.MAX_TICK - 1 : TickMath.MIN_TICK,
                            pool.tickSpacing
                        ),
                        liquidity: Number(liquidityForPosition),
                        tickLower: Number(tickLower),
                        tickUpper: Number(tickUpper),
                    });

                    const buyAmount = zeroToOne ? amount1Max : amount0Max;

                    const minBuyRate = zeroToOne ? token0PriceLower : token0PriceLower.invert();
                    const minSellRate = zeroToOne ? token0PriceLower.invert() : token0PriceLower;

                    const maxSellRate = zeroToOne ? token0PriceUpper.invert() : token0PriceUpper;

                    const maxSellAmount = maxSellRate.quote(buyAmount);
                    const minSellAmount = minSellRate.quote(buyAmount);
                    const sellAmount = maxSellAmount.add(minSellAmount).divide(2);

                    const isClosed = Number(liquidity) === 0;

                    const token0 = unwrappedToken(pool.token0);
                    const token1 = unwrappedToken(pool.token1);

                    return {
                        epoch,
                        zeroToOne,
                        isClosed,
                        liquidity,
                        initialLiquidity,
                        owner,
                        killed,
                        positionLO,
                        time:
                            Number(closeTimestamp) > 0 ? new Date(Number(closeTimestamp) * 1000) : new Date(Number(placeTimestamp) * 1000),
                        ticks: {
                            tickLower: Number(tickLower),
                            tickUpper: Number(tickUpper),
                            tickCurrent: pool.tickCurrent,
                            isClosed,
                            killed,
                            isFilled: epoch.filled,
                            zeroToOne,
                        },
                        rates: {
                            buy: {
                                token: zeroToOne ? token0 : token1,
                                rate: minBuyRate,
                            },
                            sell: {
                                token: zeroToOne ? token1 : token0,
                                rate: minSellRate,
                            },
                        },
                        amounts: {
                            buy: {
                                token: zeroToOne ? token1 : token0,
                                amount: buyAmount,
                            },
                            sell: {
                                token: zeroToOne ? token0 : token1,
                                amount: sellAmount,
                            },
                        },
                        pool,
                    };
                }
            )
            .filter(Boolean);
    }, [limitOrders, poolForLimitOrders, chainId]);

    const [closedOrders, openedOrders] = useMemo(() => {
        if (!formattedLimitOrders) return [];

        return formattedLimitOrders.reduce(
            (acc: any, order: any) => {
                if (order.isClosed && order.liquidity === "0") {
                    return [acc[0], [...acc[1], order]];
                }
                return [[...acc[0], order], acc[1]];
            },
            [[], []] as any
        );
    }, [formattedLimitOrders]);

    const limitOrdersForTable = useMemo(() => (tab ? openedOrders : closedOrders), [openedOrders, closedOrders, tab]);

    return (
        <div className="flex flex-col gap-8 w-full">
            {isLimitOrdersLoading ? (
                <LimitOrdersLoading />
            ) : (
                <>
                    <div className="bg-card border gap-4 border-card-border rounded-xl">
                        <div className="flex gap-2 p-3">
                            <Button
                                size="md"
                                className="flex h-10 min-w-[130px] items-center gap-2 border whitespace-nowrap rounded-lg p-4"
                                onClick={() => setTab(0)}
                                variant={tab === 0 ? "iconActive" : "icon"}
                            >
                                <BookOpen size={16} />
                                <span>Opened Orders</span>
                            </Button>
                            <Button
                                size="md"
                                className="flex h-10 min-w-[130px] items-center gap-2 border whitespace-nowrap rounded-lg p-4"
                                onClick={() => setTab(1)}
                                variant={tab === 1 ? "iconActive" : "icon"}
                            >
                                <History size={16} />
                                <span> Closed Orders</span>
                            </Button>
                        </div>
                        <LimitOrdersTable defaultSortingID="time" columns={limitOrderColumns} data={limitOrdersForTable} />
                    </div>
                </>
            )}
        </div>
    );
};

const LimitOrdersLoading = () => (
    <div className="flex flex-col w-full gap-4">
        <Skeleton className="w-full h-[50px] bg-card rounded-xl" />
        <Skeleton className="w-full h-[50px] bg-card rounded-xl" />
        <Skeleton className="w-full h-[50px] bg-card rounded-xl" />
    </div>
);
