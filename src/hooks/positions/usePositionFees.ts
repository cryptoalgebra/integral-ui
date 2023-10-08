
// const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)

import { useAlgebraPositionManagerOwnerOf } from "@/generated"
import { Currency, CurrencyAmount, Pool, unwrappedToken } from "@cryptoalgebra/integral-sdk"
import { useStaticCall } from "../common/useStaticCall"
import { ALGEBRA_POSITION_MANAGER } from "@/constants/addresses"
import { algebraPositionManagerABI } from "@/abis"

const MAX_UINT128 = 340282366920938463463374607431768211455n

interface PositionFeesResult {
    amount0: CurrencyAmount<Currency> | undefined
    amount1: CurrencyAmount<Currency> | undefined
}

export function usePositionFees(
    pool?: Pool,
    tokenId?: number,
    asWETH = false
): PositionFeesResult {

    const { data: owner } = useAlgebraPositionManagerOwnerOf({
        args: tokenId ? [BigInt(tokenId)] : undefined,
        watch: true
    })

    const { data: amounts } = useStaticCall({
        address: ALGEBRA_POSITION_MANAGER,
        abi: algebraPositionManagerABI,
        functionName: 'collect',
        args: tokenId && owner ? [
            {
                tokenId: tokenId,
                recipient: owner,
                amount0Max: MAX_UINT128,
                amount1Max: MAX_UINT128,
            }
        ] : undefined,
    })


    if (pool && amounts) {
        return {
            amount0: CurrencyAmount.fromRawAmount(!asWETH ? unwrappedToken(pool.token0) : pool.token0, amounts[0].toString()),
            amount1: CurrencyAmount.fromRawAmount(!asWETH ? unwrappedToken(pool.token1) : pool.token1, amounts[1].toString()),
        }
    } else {
        return {
            amount0: undefined,
            amount1: undefined
        }
    }
}
