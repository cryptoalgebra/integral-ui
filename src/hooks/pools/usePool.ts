import { useAlgebraPoolGlobalState, useAlgebraPoolLiquidity, useAlgebraPoolTickSpacing, useAlgebraPoolToken0, useAlgebraPoolToken1 } from "@/generated";
import { InitialPoolFee } from "@cryptoalgebra/integral-sdk";
import { Pool } from "@cryptoalgebra/integral-sdk";
import { Address } from "wagmi";
import { useCurrency } from "../common/useCurrency";

export const PoolState = {
  LOADING: 'LOADING',
  NOT_EXISTS: 'NOT_EXISTS',
  EXISTS: 'EXISTS',
  INVALID: 'INVALID',
} as const

export type PoolStateType = typeof PoolState[keyof typeof PoolState]

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