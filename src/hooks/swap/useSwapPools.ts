import { Currency, Token, computePoolAddress } from "@cryptoalgebra/integral-sdk"
import { useEffect, useMemo, useState } from "react"
import { useAllCurrencyCombinations } from "./useAllCurrencyCombinations"
import { Address } from "wagmi"
import { useMultiplePoolsLazyQuery } from "@/graphql/generated/graphql"

/**
 * Returns all the existing pools that should be considered for swapping between an input currency and an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useSwapPools(
    currencyIn?: Currency,
    currencyOut?: Currency
): {
    pools: { tokens: [Token, Token], pool: { address: Address, liquidity: string, price: string, tick: string } }[]
    loading: boolean
} {

    const [existingPools, setExistingPools] = useState<any[]>()

    const allCurrencyCombinations = useAllCurrencyCombinations(currencyIn, currencyOut)

    const [getMultiplePools] = useMultiplePoolsLazyQuery()

    useEffect(() => {

        async function getPools() {

            const poolsAddresses = allCurrencyCombinations.map(([tokenA, tokenB]) => computePoolAddress({
                tokenA,
                tokenB
            }) as Address)

            const poolsData = await getMultiplePools({
                variables: {
                    poolIds: poolsAddresses.map(address => address.toLowerCase())
                }
            })

            // const poolsLiquidities = await Promise.allSettled(poolsAddresses.map(address => getAlgebraPool({
            //     address
            // }).read.liquidity()))

            // const poolsGlobalStates = await Promise.allSettled(poolsAddresses.map(address => getAlgebraPool({
            //     address
            // }).read.globalState()))

            const pools = poolsData.data && poolsData.data.pools.map(pool => ({ address: pool.id, liquidity: pool.liquidity, price: pool.sqrtPrice, tick: pool.tick }))

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
            pools: allCurrencyCombinations.map((tokens, idx) => ({
                tokens,
                pool: existingPools[idx]
            }))
                .filter(({ pool }) => {
                    return pool
                }),
            loading: false
        }
    }, [allCurrencyCombinations, existingPools])
}
