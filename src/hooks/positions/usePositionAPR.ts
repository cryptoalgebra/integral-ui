import { useAlgebraPoolLiquidity } from "@/generated"
import { usePoolFeeDataQuery, useSinglePoolQuery } from "@/graphql/generated/graphql"
import { Position } from "@cryptoalgebra/integral-sdk"
import { Address } from "wagmi"

export function usePositionAPR(poolId: Address | undefined, position: Position | undefined) {

    const { data: liquidity, isLoading } = useAlgebraPoolLiquidity({
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

    const poolDayFees = poolFeeData && Boolean(poolFeeData.poolDayDatas.length) && poolFeeData.poolDayDatas[0].feesUSD

    const yearFee = poolDayFees && poolDayFees * 365

    const liquidityRelation = position && liquidity && Number(position.liquidity.toString()) / Number(liquidity)

    const [amount0, amount1] = position ? [position.amount0.toSignificant(), position.amount1.toSignificant()] : [0, 0]

    const tvl = pool && pool.pool && (Number(pool.pool.token0Price) * Number(amount0) + Number(pool.pool.token1Price) * Number(amount1))

    return liquidityRelation && yearFee && tvl && (yearFee * liquidityRelation / tvl)

}