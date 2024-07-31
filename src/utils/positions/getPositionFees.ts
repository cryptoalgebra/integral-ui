import { MAX_UINT128 } from "@/constants/max-uint128";
import { getAlgebraPositionManager } from "@/generated";
import { CurrencyAmount, Pool, unwrappedToken } from "@cryptoalgebra/scribe-sdk";

export async function getPositionFees(pool: Pool, positionId: number) {

    try {

        const algebraPositionManager = getAlgebraPositionManager({})

        const owner = await algebraPositionManager.read.ownerOf([BigInt(positionId)])

        const { result: [fees0, fees1] } = await algebraPositionManager.simulate.collect([
            {
                tokenId: BigInt(positionId),
                recipient: owner,
                amount0Max: MAX_UINT128,
                amount1Max: MAX_UINT128
            },
        ], {
            account: owner
        })

        return [
            CurrencyAmount.fromRawAmount(unwrappedToken(pool.token0), fees0.toString()),
            CurrencyAmount.fromRawAmount(unwrappedToken(pool.token1), fees1.toString())
        ]

    } catch {
        return [undefined, undefined]
    }

}
