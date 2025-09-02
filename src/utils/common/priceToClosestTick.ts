import { encodeSqrtRatioX96, nearestUsableTick, Price, TickMath, Token, tryParsePrice } from "@cryptoalgebra/custom-pools-sdk";
import JSBI from "jsbi";

const ABS = (x: any) => (JSBI.lessThan(x, JSBI.BigInt(0)) ? JSBI.multiply(x, JSBI.BigInt(-1)) : x);

export function priceToClosestTick(price: Price<Token, Token>): number {
    const sorted = price.baseCurrency.sortsBefore(price.quoteCurrency);

    const sqrtInput = sorted
        ? encodeSqrtRatioX96(price.numerator, price.denominator)
        : encodeSqrtRatioX96(price.denominator, price.numerator);

    // initial tick
    const tick = TickMath.getTickAtSqrtRatio(sqrtInput);

    // check tick-1, tick, tick+1
    const candidates = [tick - 1, tick, tick + 1].filter((t) => t >= TickMath.MIN_TICK && t <= TickMath.MAX_TICK);

    let bestTick = tick;
    let bestDiff = ABS(JSBI.subtract(sqrtInput, TickMath.getSqrtRatioAtTick(tick)));

    for (const t of candidates) {
        const diff = ABS(JSBI.subtract(sqrtInput, TickMath.getSqrtRatioAtTick(t)));
        if (JSBI.lessThan(diff, bestDiff)) {
            bestDiff = diff;
            bestTick = t;
        }
    }

    return bestTick;
}

export function tryParseTick(baseToken?: Token, quoteToken?: Token, value?: string, tickSpacing?: number): number | undefined {
    if (!baseToken || !quoteToken || !value || !tickSpacing) {
        return undefined;
    }

    const price = tryParsePrice(baseToken, quoteToken, value);

    if (!price) {
        return undefined;
    }

    let tick: number;

    // check price is within min/max bounds, if outside return min/max
    const sqrtRatioX96 = encodeSqrtRatioX96(price.numerator, price.denominator);

    if (JSBI.greaterThanOrEqual(sqrtRatioX96, TickMath.MAX_SQRT_RATIO)) {
        tick = TickMath.MAX_TICK;
    } else if (JSBI.lessThanOrEqual(sqrtRatioX96, TickMath.MIN_SQRT_RATIO)) {
        tick = TickMath.MIN_TICK;
    } else {
        // this function is agnostic to the base, will always return the correct tick
        tick = priceToClosestTick(price);
    }

    return nearestUsableTick(tick, tickSpacing);
}
