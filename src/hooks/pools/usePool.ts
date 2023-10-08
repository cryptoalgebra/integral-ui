import { DEFAULT_CHAIN_ID } from "@/constants/default-chain-id";
import { algebraPoolABI, getAlgebraPool, useAlgebraPoolGlobalState, useAlgebraPoolLiquidity, useAlgebraPoolTickSpacing, useAlgebraPoolToken0, useAlgebraPoolToken1 } from "@/generated";
import { INITIAL_POOL_FEE, InitialPoolFee, POOL_DEPLOYER_ADDRESSES } from "@cryptoalgebra/integral-sdk";
import { Currency, Pool, Token } from "@cryptoalgebra/integral-sdk";
import { computePoolAddress } from "@cryptoalgebra/integral-sdk";
import { useEffect, useMemo, useState } from "react";
import { Address, useContractReads, useNetwork, useToken } from "wagmi";
import { useCurrency } from "../common/useCurrency";

export const PoolState = {
  LOADING: 'LOADING',
  NOT_EXISTS: 'NOT_EXISTS',
  EXISTS: 'EXISTS',
  INVALID: 'INVALID',
} as const

export type PoolStateType = typeof PoolState[keyof typeof PoolState]

// export function usePools(pool: Address): [PoolState, Pool | null][] {

//   const transformed: ([Token, Token] | null)[] = useMemo(() => {
//     return poolKeys.map(([currencyA, currencyB]) => {
//       if (!chain || !currencyA || !currencyB) return null

//       const tokenA = currencyA?.wrapped
//       const tokenB = currencyB?.wrapped

//       if (!tokenA || !tokenB || tokenA.equals(tokenB)) return null
//       const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
//       return [token0, token1]
//     })
//   }, [chain, poolKeys])

//   const poolAddresses: (Address | undefined)[] = useMemo(() => {
//     const poolDeployerAddress = chain && POOL_DEPLOYER_ADDRESSES[DEFAULT_CHAIN_ID]

//     console.log('poolDeployerAddress', poolDeployerAddress)

//     return transformed.map((value) => {
//       if (!poolDeployerAddress || !value) return undefined
//       return computePoolAddress({
//         poolDeployer: poolDeployerAddress,
//         tokenA: value[0],
//         tokenB: value[1],
//       }) as Address
//     })
//   }, [chain, transformed])

//   console.log('poolAddresses', chain, transformed, poolAddresses)

//   const { data: tickSpacings, isLoading: isTickSpacingsLoading, isError: isTickSpacingsError } = useContractReads({ contracts: poolAddresses.map(address => ({ address: address, abi: algebraPoolABI, functionName: 'tickSpacing' })), watch: true })

//   const { data: globalState0s, isLoading: isGlobalStatesLoading, isError: isGlobalStatesError } = useContractReads({ contracts: poolAddresses.map(address => ({ address: address, abi: algebraPoolABI, functionName: 'globalState' })), watch: true })

//   const { data: liquidities, isLoading: isLiquiditiesLoading, isError: isLiquiditiesError } = useContractReads({ contracts: poolAddresses.map(address => ({ address: address, abi: algebraPoolABI, functionName: 'liquidity' })), watch: true })

//   return useMemo(() => {
//     return poolKeys.map((_key, index) => {
//       const [token0, token1] = transformed[index] ?? []
//       if (!token0 || !token1) return [PoolState.INVALID, null]

//       if (isGlobalStatesError || isLiquiditiesError || isTickSpacingsError) return [PoolState.INVALID, null]
//       if (isGlobalStatesLoading || isLiquiditiesLoading || isTickSpacingsLoading) return [PoolState.LOADING, null]

//       if (!globalState0s || !liquidities || !tickSpacings) return [PoolState.NOT_EXISTS, null]

//       const globalState = globalState0s[index].result as any[];
//       const liquidity = liquidities[index].result as number;
//       const tickSpacing = tickSpacings[index].result as number;

//       if (globalState === undefined || liquidity === undefined || tickSpacing === undefined) return [PoolState.NOT_EXISTS, null];

//       if (!globalState[0] || globalState[0] === BigInt(0)) return [PoolState.NOT_EXISTS, null]

//       try {
// return [PoolState.EXISTS, new Pool(token0, token1, globalState[2], globalState[0].toString(), liquidity.toString(), globalState[1], tickSpacing)]
//       } catch (error) {
//         return [PoolState.NOT_EXISTS, null]
//       }
//     })
//   }, [liquidities, poolKeys, globalState0s, tickSpacings, transformed])

// }

// export function usePool(
//   currencyA: Currency | undefined,
//   currencyB: Currency | undefined
// ): [PoolState, Pool | null] {
//   const poolKeys: [Currency | undefined, Currency | undefined][] = useMemo(
//     () => [[currencyA, currencyB]],
//     [currencyA, currencyB]
//   )

//   return usePools(poolKeys)[0]
// }

export function usePool(address: Address | undefined): [PoolStateType, Pool | null] {

  const { data: tickSpacing, isLoading: isTickSpacingLoading, isError: isTickSpacingError } = useAlgebraPoolTickSpacing({
    address
  })
  const { data: globalState, isLoading: isGlobalStateLoading, isError: isGlobalStateError } = useAlgebraPoolGlobalState({
    address
  })
  const { data: liquidity, isLoading: isLiquidityLoading, isError: isLiquidityError } = useAlgebraPoolLiquidity({
    address
  })

  const { data: token0Address, isLoading: isLoadingToken0, isError: isToken0Error } = useAlgebraPoolToken0({
    address
  })
  const { data: token1Address, isLoading: isLoadingToken1, isError: isToken1Error } = useAlgebraPoolToken1({
    address
  })

  const token0 = useCurrency(token0Address)
  const token1 = useCurrency(token1Address)

  const isPoolError = isTickSpacingError || isGlobalStateError || isLiquidityError || isToken0Error || isToken1Error || !address

  if (isPoolError) return [PoolState.INVALID, null]

  const isPoolLoading = isTickSpacingLoading || isGlobalStateLoading || isLiquidityLoading || isLoadingToken0 || isLoadingToken1
  const isTokensLoading = !token0 || !token1

  if (isPoolLoading || isTokensLoading) return [PoolState.LOADING, null]

  if (!tickSpacing || !globalState || !liquidity) return [PoolState.NOT_EXISTS, null]

  if (globalState[0] === 0n) return [PoolState.NOT_EXISTS, null]

  try {
    return [PoolState.EXISTS, new Pool(token0.wrapped, token1.wrapped, globalState[2] as InitialPoolFee, globalState[0].toString(), Number(liquidity), globalState[1], tickSpacing)]
  } catch (error) {
    return [PoolState.NOT_EXISTS, null]
  }

}