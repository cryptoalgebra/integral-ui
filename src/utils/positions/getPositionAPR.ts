import { getAlgebraPool } from "@/generated"
import { Position } from "@cryptoalgebra/integral-sdk"
import { PoolDayDataFieldsFragment, PoolFieldsFragment } from "@/graphql/generated/graphql"
import { Address } from "wagmi"

export async function getPositionAPR(
    poolId: Address, 
    position: Position, 
    pool: PoolFieldsFragment | undefined | null, 
    poolFeeData: PoolDayDataFieldsFragment[] | undefined, 
    nativePrice: string | undefined 
) {

    if (!pool || !poolFeeData || !nativePrice) return

    const algebraPool = getAlgebraPool({
        address: poolId
    })

    try {

        const liquidity = await algebraPool.read.liquidity()

        const poolDayFees = poolFeeData && Boolean(poolFeeData.length) && poolFeeData.reduce((acc, v) => acc + Number(v.feesUSD), 0)

        const yearFee = poolDayFees && poolDayFees * 365

        const liquidityRelation = position && liquidity && Number(position.liquidity.toString()) / Number(liquidity)

        const [amount0, amount1] = position ? [position.amount0.toSignificant(), position.amount1.toSignificant()] : [0, 0]

        const tvl = pool && (Number(pool.token0.derivedMatic) * Number(nativePrice) * Number(amount0) + Number(pool.token1.derivedMatic) * Number(nativePrice) * Number(amount1))

        return liquidityRelation && yearFee && tvl && ((yearFee * liquidityRelation) / tvl) * 100

    } catch {
        return 0
    }


}