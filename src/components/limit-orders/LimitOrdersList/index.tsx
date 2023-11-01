import { useMemo, useState } from "react"
import { useAccount } from "wagmi"
import { limitOrderColumns } from "@/components/common/Table/limitOrderColumns"
import { Skeleton } from "@/components/ui/skeleton"
import { DEFAULT_CHAIN_ID } from "@/constants/default-chain-id"
import { useLimitOrdersListQuery, useMultiplePoolsQuery } from "@/graphql/generated/graphql"
import { useClients } from "@/hooks/graphql/useClients"
import { INITIAL_POOL_FEE, Pool, Position, TickMath, Token } from "@cryptoalgebra/integral-sdk"
import DataTable from "@/components/common/Table/dataTable"

const LimitOrdersList = () => {

    const { address: account } = useAccount()

    const [tab, setTab] = useState(0)

    const { limitOrderClient } = useClients()

    const { data: limitOrders, loading: isLimitOrdersLoading } = useLimitOrdersListQuery({
        client: limitOrderClient,
        variables: {
            account
        },
        pollInterval: 10_000
    })

    const { data: poolForLimitOrders } = useMultiplePoolsQuery({
        variables: {
            poolIds: limitOrders && limitOrders.limitOrders.map(({ pool }) => pool)
        }
    })

    const formattedLimitOrders = useMemo(() => {

        if (!limitOrders || !poolForLimitOrders) return []

        const pools: { [key: string]: Pool } = poolForLimitOrders.pools.reduce((acc, { id, token0, token1, sqrtPrice, liquidity, tick, tickSpacing }) => ({
            ...acc,
            [id]: new Pool(
                new Token(DEFAULT_CHAIN_ID, token0.id, Number(token0.decimals), token0.symbol, token0.name),
                new Token(DEFAULT_CHAIN_ID, token1.id, Number(token1.decimals), token1.symbol, token1.name),
                INITIAL_POOL_FEE,
                sqrtPrice,
                liquidity,
                Number(tick),
                tickSpacing
            )
        }), {})

        return limitOrders.limitOrders.map(({ liquidity, initialLiquidity, killedLiquidity, owner, tickLower, tickUpper, zeroToOne, epoch, pool: poolId, killed }) => {

            const pool = pools[poolId]

            const liquidityForPosition = epoch.filled ? BigInt(initialLiquidity) - BigInt(killedLiquidity) : liquidity

            const positionLO = new Position({
                pool,
                liquidity: Number(liquidityForPosition),
                tickLower: Number(tickLower),
                tickUpper: Number(tickUpper)
            })

            const { amount0: amount0LO, amount1: amount1LO, token0PriceLower } = positionLO

            const { amount0: amount0Max, amount1: amount1Max } = new Position({
                pool: new Pool(pool.token0, pool.token1, pool.fee, zeroToOne ? TickMath.MAX_SQRT_RATIO : TickMath.MIN_SQRT_RATIO, pool.liquidity, zeroToOne ? TickMath.MAX_TICK - 1 : TickMath.MIN_TICK, pool.tickSpacing),
                liquidity: Number(liquidityForPosition),
                tickLower: Number(tickLower),
                tickUpper: Number(tickUpper)
            })

            const amount0 = zeroToOne ? amount0LO : amount1LO

            const isClosed = Number(liquidity) === 0

            return {
                epoch,
                zeroToOne,
                isClosed,
                liquidity,
                initialLiquidity,
                owner,
                killed,
                ticks: {
                    tickLower: Number(tickLower),
                    tickUpper: Number(tickUpper),
                    tickCurrent: pool.tickCurrent,
                    isClosed,
                    killed,
                    isFilled: epoch.filled,
                    zeroToOne
                },
                rates: {
                    buy: {
                        token: zeroToOne ? pool.token0 : pool.token1,
                        rate: zeroToOne ? token0PriceLower : token0PriceLower.invert(),
                    },
                    sell: {
                        token: zeroToOne ? pool.token1 : pool.token0,
                        rate: zeroToOne ? token0PriceLower.invert() : token0PriceLower,
                    }
                },
                amounts: {
                    buy: {
                        token: zeroToOne ? pool.token1 : pool.token0,
                        amount: zeroToOne ? amount1Max : amount0Max
                    },
                    sell: {
                        token: zeroToOne ? pool.token0 : pool.token1,
                        amount: zeroToOne ? amount0 : amount1LO
                    }
                },
                pool
            }
        })

    }, [limitOrders, poolForLimitOrders])

    const [closedOrders, openedOrders] = useMemo(() => {

        if (!formattedLimitOrders) return []

        return formattedLimitOrders.reduce((acc, order) => {
            if (order.isClosed && order.liquidity === '0') {
                return [
                    acc[0],
                    [...acc[1], order]
                ]
            }
            return [
                [...acc[0], order],
                acc[1]
            ]
        }, [[], []] as any)

    }, [formattedLimitOrders])


    const limitOrdersForTable = useMemo(() => tab ? openedOrders : closedOrders, [openedOrders, closedOrders, tab])

    return <div className="flex flex-col gap-8 w-full">
        {isLimitOrdersLoading ? <LimitOrdersLoading /> : <>
            <div className="flex gap-4">
                <button onClick={() => setTab(0)} className={`py-2 px-4 bg-card relative rounded-3xl font-semibold duration-300 ${tab === 0 ? 'text-primary-text bg-muted-primary' : 'hover:bg-card-hover'}`}>Opened Orders</button>
                <button onClick={() => setTab(1)} className={`relative py-2 px-4 bg-card relative rounded-3xl font-semibold duration-300 ${tab === 1 ? 'text-primary-text bg-muted-primary' : 'hover:bg-card-hover'}`}>Closed Orders</button>
            </div>
            <div className="pb-4 bg-card border border-card-border rounded-3xl">
                <DataTable columns={limitOrderColumns} data={limitOrdersForTable} />
            </div>
        </>}
    </div>

}

const LimitOrdersLoading = () => <div className="flex flex-col w-full gap-4">
    <Skeleton className="w-full h-[50px] bg-card rounded-xl" />
    <Skeleton className="w-full h-[50px] bg-card rounded-xl" />
    <Skeleton className="w-full h-[50px] bg-card rounded-xl" />
</div>

export default LimitOrdersList