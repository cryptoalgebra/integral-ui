import {
  useReadNonfungiblePositionManagerOwnerOf,
  useSimulateNonfungiblePositionManagerCollect,
} from '@/generated';
import { type Currency, CurrencyAmount, Pool } from '@cryptoalgebra/integral-sdk';
import { useMemo } from 'react';
import { type Address, maxUint128 } from 'viem';
import { useUSDCValue } from '../common/useUSDCValue';
import { unwrappedToken } from '@/utils/common/unwrappedToken';

interface PositionFeesResult {
  amount0: CurrencyAmount<Currency> | undefined;
  amount1: CurrencyAmount<Currency> | undefined;
  amount0Usd: number | null | undefined;
  amount1Usd: number | null | undefined;
  totalUsd: number | null | undefined;
  refetch: (() => void) | undefined;
}

export function usePositionFees(
  pool?: Pool,
  tokenId?: number,
  asNative = false,
): PositionFeesResult {
  const { data: owner } = useReadNonfungiblePositionManagerOwnerOf({
    args: tokenId ? [BigInt(tokenId)] : undefined,
  });

  const isReady = tokenId && owner;

  const { data: amountsConfig, refetch } = useSimulateNonfungiblePositionManagerCollect({
    args: isReady
      ? [
          {
            tokenId: BigInt(tokenId || 0),
            recipient: owner as Address,
            amount0Max: maxUint128,
            amount1Max: maxUint128,
          },
        ]
      : undefined,
  });

  const amounts = amountsConfig?.result;

  const amount0 =
    pool &&
    amounts &&
    CurrencyAmount.fromRawAmount(
      asNative ? unwrappedToken(pool.token0) : pool.token0,
      amounts[0].toString(),
    );
  const amount1 =
    pool &&
    amounts &&
    CurrencyAmount.fromRawAmount(
      asNative ? unwrappedToken(pool.token1) : pool.token1,
      amounts[1].toString(),
    );

  const { formatted: amount0Usd } = useUSDCValue(amount0);
  const { formatted: amount1Usd } = useUSDCValue(amount1);

  const totalUsd = (amount0Usd || 0) + (amount1Usd || 0);

  return useMemo(() => {
    if (pool && amounts) {
      return {
        amount0,
        amount1,
        amount0Usd,
        amount1Usd,
        totalUsd,
        refetch,
      };
    } else {
      return {
        amount0: undefined,
        amount1: undefined,
        amount0Usd: undefined,
        amount1Usd: undefined,
        totalUsd: undefined,
        refetch: undefined,
      };
    }
  }, [pool, amounts, amount0, amount1, amount0Usd, amount1Usd, totalUsd]);
}
