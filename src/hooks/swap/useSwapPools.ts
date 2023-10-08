import { Currency, POOL_DEPLOYER_ADDRESSES, Pool, Token, computePoolAddress } from "@cryptoalgebra/integral-sdk"
import { useEffect, useMemo, useState } from "react"
import { PoolState, usePool } from "../pools/usePool"
import { useAllCurrencyCombinations } from "./useAllCurrencyCombinations"
import { ALGEBRA_POOL_DEPLOYER } from "@/constants/addresses"
import { getAlgebraPool } from "@/generated"
import { Address } from "wagmi"

/**
 * Returns all the existing pools that should be considered for swapping between an input currency and an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useSwapPools(
    currencyIn?: Currency,
    currencyOut?: Currency
): {
    pools: [Token, Token][]
    loading: boolean
} {

    const [existingPools, setExistingPools] = useState<boolean[]>()

    const allCurrencyCombinations = useAllCurrencyCombinations(currencyIn, currencyOut)

    useEffect(() => {

        async function getPools() {

            const poolsAddresses = allCurrencyCombinations.map(([tokenA, tokenB]) => computePoolAddress({
                tokenA,
                tokenB
            }) as Address)

            const poolsRequests = await Promise.allSettled(poolsAddresses.map(address => getAlgebraPool({
                address
            }).read.tickSpacing()))

            const pools = poolsRequests.map(res => res.status === 'fulfilled' ? true : false)

            setExistingPools(pools)

        }

        Boolean(allCurrencyCombinations.length) && getPools()

    }, [allCurrencyCombinations])

    return useMemo(() => {

        if (!existingPools) return {
            pools: [],
            loading: true
        }

        return {
            pools: allCurrencyCombinations
                .filter((_, idx) => {
                    return existingPools[idx]
                }),
            loading: false
        }
    }, [allCurrencyCombinations, existingPools])
}
