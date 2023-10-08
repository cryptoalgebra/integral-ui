import { getAlgebraPool } from "@/generated"
import { Position } from "@cryptoalgebra/integral-sdk"
import { PoolDayDataFieldsFragment, PoolFieldsFragment } from "@/graphql/generated/graphql"
import { Address } from "wagmi"

export async function getPositionAPR(poolId: Address, position: Position, pool: PoolFieldsFragment | undefined | null, poolFeeData: PoolDayDataFieldsFragment[] | undefined) {

    if (!pool || !poolFeeData) return

    const algebraPool = getAlgebraPool({
        address: poolId
    })

    try {

        const liquidity = await algebraPool.read.liquidity()

        const poolDayFees = poolFeeData && Boolean(poolFeeData.length) && poolFeeData[0].feesUSD

        const yearFee = poolDayFees && poolDayFees * 365

        const liquidityRelation = position && liquidity && Number(position.liquidity.toString()) / Number(liquidity)

        const [amount0, amount1] = position ? [position.amount0.toSignificant(), position.amount1.toSignificant()] : [0, 0]

        const tvl = pool && (Number(pool.token1Price) * Number(amount0) + Number(pool.token0Price) * Number(amount1))

        return liquidityRelation && yearFee && tvl && (yearFee * liquidityRelation / tvl)

    } catch {
        return 0
    }


}