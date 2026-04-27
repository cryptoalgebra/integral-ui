import { useEffect, useMemo } from 'react';
import JSBI from 'jsbi';
import { type ChartEntry } from './types';
import { CurrencyAmount, TickMath, type Pool } from '@cryptoalgebra/integral-sdk';
import { useInfoTickData } from '@/hooks/pools/usePoolTickData';
import { AmountsMath } from '@/utils/mint/amountsMath';

export function useDensityChartData({
  pool,
  isSorted,
}: {
  pool: Pool | undefined | null;
  isSorted: boolean;
}) {
  const {
    fetchTicksSurroundingPrice: { ticksResult, fetchTicksSurroundingPrice, ticksLoading },
  } = useInfoTickData();

  useEffect(() => {
    if (!pool) return;
    fetchTicksSurroundingPrice(pool);
  }, [pool]);

  const formattedData = useMemo(() => {
    if (!ticksResult) {
      return undefined;
    }

    const data = ticksResult.ticksProcessed;

    const newData: ChartEntry[] = [];

    for (let i = 0; i < data.length; i++) {
      const t = data[i];

      try {
        const sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(t.tickIdx);
        const sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(
          t.tickIdx + (isSorted ? 1 : -1) * ticksResult.tickSpacing,
        );

        const { amount0, amount1 } = AmountsMath.getAmountsForLiquidity(
          JSBI.BigInt(ticksResult.sqrtRatioX96),
          sqrtRatioAX96,
          sqrtRatioBX96,
          JSBI.BigInt(t.liquidityActive.toString()),
        );

        const currencyAmount0 = CurrencyAmount.fromRawAmount(ticksResult.token0, amount0);
        const currencyAmount1 = CurrencyAmount.fromRawAmount(ticksResult.token1, amount1);

        const isCurrent = currencyAmount0.greaterThan(0) && currencyAmount1.greaterThan(0);

        // const activeLiquidityUsd =
        //   currencyAPriceUSD * Number(currencyAmount0.toSignificant(24)) +
        //   currencyAPriceUSD * Number(currencyAmount1.toSignificant(24));

        const chartEntry = {
          activeLiquidity: parseFloat(t.liquidityActive.toString()),
          price0: isSorted ? parseFloat(t.price0.toString()) : parseFloat(t.price1.toString()),

          amount0: currencyAmount0,
          amount1: currencyAmount1,
          isCurrent,
        };

        if (chartEntry.activeLiquidity > 0) {
          newData.push(chartEntry);
        }
      } catch (e) {
        console.error(e);
        // eslint-disable-next-line no-continue
        continue;
      }
    }

    return newData;
  }, [ticksResult, isSorted]);

  return {
    formattedData,
    isLoading: ticksLoading && !formattedData,
  };
}
