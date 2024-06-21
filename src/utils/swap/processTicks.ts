import { MAX_UINT128 } from "@/constants/max-uint128";
import { TicksResult } from "@/types/ticks-info";
import { Currency, CurrencyAmount, INITIAL_POOL_FEE, Pool, TickMath, Token } from "@cryptoalgebra/integral-sdk";

export async function processTicks(
    currencyA: Currency,
    currencyB: Currency,
    tick: number,
    ticksResult: TicksResult,
    tickAfterSwap: number | null | undefined
) {
    const _data = await Promise.all(
        ticksResult.ticksProcessed.map(async (t, i) => {
            const currentTick = t.tickIdx;
            const nextTick = ticksResult.ticksProcessed[i + 1]?.tickIdx;
            const prevTick = ticksResult.ticksProcessed[i - 1]?.tickIdx;

            const active = currentTick <= tick && tick < nextTick;

            const afterSwap = tickAfterSwap && tickAfterSwap >= currentTick && tickAfterSwap < nextTick;

            const afterSwapRange =
                tickAfterSwap && ((tickAfterSwap >= currentTick && currentTick >= tick) || (tickAfterSwap <= nextTick && nextTick <= tick));

            const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(currentTick);
            const mockTicks = [
                {
                    index: Number(currentTick) - Number(ticksResult.tickSpacing),
                    liquidityGross: t.liquidityGross.toString(),
                    liquidityNet: (t.liquidityNet * -1n).toString(),
                },
                {
                    index: currentTick,
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
                          currentTick,
                          ticksResult.tickSpacing,
                          mockTicks
                      )
                    : undefined;

            const nextSqrtX96 = prevTick ? TickMath.getSqrtRatioAtTick(prevTick) : undefined;

            const maxAmountToken0 = currencyA ? CurrencyAmount.fromRawAmount(currencyA.wrapped, MAX_UINT128.toString()) : undefined;

            const outputRes0 = pool && maxAmountToken0 ? await pool.getOutputAmount(maxAmountToken0, nextSqrtX96) : undefined;

            const token1Amount = outputRes0?.[0] as CurrencyAmount<Token> | undefined;

            const amount0 = token1Amount ? parseFloat(token1Amount.toExact()) * parseFloat(t.price1) : 0;
            const amount1 = token1Amount ? parseFloat(token1Amount.toExact()) : 0;

            return {
                index: i,
                isCurrent: active,
                isAfterSwapRange: afterSwapRange,
                isAfterSwapTick: afterSwap,
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
