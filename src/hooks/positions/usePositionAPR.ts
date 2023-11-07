import { useAlgebraPoolLiquidity } from "@/generated"
import { useNativePriceQuery, usePoolFeeDataQuery, useSinglePoolQuery } from "@/graphql/generated/graphql"
import { Position } from "@cryptoalgebra/integral-sdk"
import { Address } from "wagmi"

export function usePositionAPR(
    poolId: Address | undefined,
    position: Position | undefined,
    positionId?: string | undefined
) {

    const { data: liquidity } = useAlgebraPoolLiquidity({
        address: poolId
    })

    const { data: pool } = useSinglePoolQuery({
        variables: {
            poolId: poolId as string
        }
    })

    const { data: poolFeeData } = usePoolFeeDataQuery({
        variables: {
            poolId
        }
    })

    const { data: bundles } = useNativePriceQuery()

    const nativePrice = bundles?.bundles[0] && Number(bundles.bundles[0].maticPriceUSD)

    const poolDayFees = poolFeeData && Boolean(poolFeeData.poolDayDatas.length) && poolFeeData.poolDayDatas.reduce((acc, v) => acc + Number(v.feesUSD), 0)

    const yearFee = poolDayFees && poolDayFees * 365

    const liquidityRelation = position && liquidity && Number(position.liquidity.toString()) / (Number(liquidity) + (positionId ? 0 : Number(position.liquidity.toString()))) 

    const [amount0, amount1] = position ? [position.amount0.toSignificant(), position.amount1.toSignificant()] : [0, 0]

    const tvl = 
        pool?.pool && nativePrice && 
        (Number(pool.pool.token0.derivedMatic) * nativePrice * Number(amount0) + 
        Number(pool.pool.token1.derivedMatic) * nativePrice * Number(amount1))

    return liquidityRelation && yearFee && tvl && ((yearFee * liquidityRelation) / tvl) * 100

}