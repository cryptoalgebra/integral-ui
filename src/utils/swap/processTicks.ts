import { MAX_UINT128 } from "@/constants/max-uint128";
import { TicksResult } from "@/types/ticks-info";
import { Currency, CurrencyAmount, DEFAULT_TICK_SPACING, INITIAL_POOL_FEE, Pool, TickMath, Token } from "@cryptoalgebra/integral-sdk";

export async function processTicks(currencyA: Currency, currencyB: Currency, ticksResult?: TicksResult, tickAfterSwap?: number | null) {
    if (!ticksResult) return;

    const isReversed = tickAfterSwap && tickAfterSwap > ticksResult.activeTickIdx;

    const _data = await Promise.all(
        ticksResult.ticksProcessed.map(async (t, i) => {
            const active = t.tickIdx === ticksResult.activeTickIdx;
            const afterSwapRange = isReversed
                ? tickAfterSwap >= t.tickIdx && t.tickIdx >= ticksResult.activeTickIdx
                : tickAfterSwap && tickAfterSwap <= t.tickIdx && t.tickIdx <= ticksResult.activeTickIdx;

            const afterSwapTick = isReversed
                ? tickAfterSwap + DEFAULT_TICK_SPACING >= t.tickIdx && tickAfterSwap <= t.tickIdx
                : tickAfterSwap && tickAfterSwap - DEFAULT_TICK_SPACING <= t.tickIdx && tickAfterSwap >= t.tickIdx;

            const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(t.tickIdx);
            const mockTicks = [
                {
                    index: Number(t.tickIdx) - Number(ticksResult.tickSpacing),
                    liquidityGross: t.liquidityGross.toString(),
                    liquidityNet: (t.liquidityNet * -1n).toString(),
                },
                {
                    index: t.tickIdx,
                    liquidityGross: t.liquidityGross.toString(),
                    liquidityNet: t.liquidityNet.toString(),
                },
            ];
            const pool =
                currencyA && currencyB
                    ? new Pool(
                          currencyA.wrapped,
                          currencyB.wrapped,
                          INITIAL_POOL_FEE,
                          sqrtPriceX96,
                          t.liquidityActive.toString(),
                          t.tickIdx,
                          ticksResult.tickSpacing,
                          mockTicks
                      )
                    : undefined;

            const nextSqrtX96 = ticksResult.ticksProcessed[i - 1]
                ? TickMath.getSqrtRatioAtTick(ticksResult.ticksProcessed[i - 1].tickIdx)
                : undefined;

            const maxAmountToken0 = currencyA ? CurrencyAmount.fromRawAmount(currencyA.wrapped, MAX_UINT128.toString()) : undefined;

            const outputRes0 = pool && maxAmountToken0 ? await pool.getOutputAmount(maxAmountToken0, nextSqrtX96) : undefined;

            const token1Amount = outputRes0?.[0] as CurrencyAmount<Token> | undefined;

            const amount0 = token1Amount ? parseFloat(token1Amount.toExact()) * parseFloat(t.price1) : 0;
            const amount1 = token1Amount ? parseFloat(token1Amount.toExact()) : 0;

            return {
                index: i,
                isCurrent: active,
                isAfterSwapRange: afterSwapRange,
                isAfterSwapTick: afterSwapTick,
                isReversed,
                activeLiquidity: parseFloat(t.liquidityActive.toString()),
                price0: parseFloat(t.price0),
                price1: parseFloat(t.price1),
                tvlToken0: amount0,
                tvlToken1: amount1,
            };
        })
    );
    return _data;
}
