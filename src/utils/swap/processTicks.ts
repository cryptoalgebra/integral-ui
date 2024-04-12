import { TicksResult } from "@/types/ticks-info"
import { DEFAULT_TICK_SPACING } from "@cryptoalgebra/integral-sdk"

export async function processTicks(ticksResult?: TicksResult, tickAfterSwap?: number | null) {
    if (!ticksResult) return

    const isReversed = tickAfterSwap && tickAfterSwap > ticksResult.activeTickIdx;

    const _data = await Promise.all(
        ticksResult.ticksProcessed.map(async (t, i) => {
            const active = t.tickIdx === ticksResult.activeTickIdx
            const afterSwapRange = isReversed ? 
                tickAfterSwap >= t.tickIdx && t.tickIdx >= ticksResult.activeTickIdx 
                : 
                tickAfterSwap && tickAfterSwap <= t.tickIdx && t.tickIdx <= ticksResult.activeTickIdx;

            const afterSwapTick = isReversed ? 
                tickAfterSwap + DEFAULT_TICK_SPACING >= t.tickIdx && tickAfterSwap <= t.tickIdx
                :
                tickAfterSwap && tickAfterSwap - DEFAULT_TICK_SPACING <= t.tickIdx && tickAfterSwap >= t.tickIdx
            
            return {
                index: i,
                isCurrent: active,
                isAfterSwapRange: afterSwapRange,
                isAfterSwapTick: afterSwapTick,
                activeLiquidity: parseFloat(t.liquidityActive.toString()),
                price0: parseFloat(t.price0),
                price1: parseFloat(t.price1),
            }
        })
    )
    return _data;
}