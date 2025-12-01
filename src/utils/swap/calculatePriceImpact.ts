import { Route, Currency, BoostedRoute, Percent } from "@cryptoalgebra/custom-pools-sdk";

/**
 * Calculate price impact from sqrtPriceX96 before and after swap
 */
export function calculatePriceImpact(
    route: Route<Currency, Currency> | BoostedRoute<Currency, Currency>,
    sqrtPriceX96AfterList: bigint[]
): Percent | null {
    const pools = route.pools;
    if (pools.length === 0) return null;

    // Filter non-zero values (WRAP/UNWRAP steps return 0, only SWAP steps have sqrtPrice)
    const swapPricesAfter = sqrtPriceX96AfterList.filter((p) => p !== 0n);
    if (swapPricesAfter.length === 0) return null;

    let ratioNum = 1n;
    let ratioDen = 1n;

    for (let i = 0; i < Math.min(pools.length, swapPricesAfter.length); i++) {
        const sqrtBefore = BigInt(pools[i].sqrtRatioX96.toString());
        const sqrtAfter = swapPricesAfter[i];

        if (!sqrtAfter || sqrtAfter === 0n || sqrtBefore === 0n) continue;

        ratioNum *= sqrtAfter * sqrtAfter;
        ratioDen *= sqrtBefore * sqrtBefore;
    }

    if (ratioDen === 0n) return null;

    const diff = ratioNum > ratioDen ? ratioNum - ratioDen : ratioDen - ratioNum;
    const impactBps = (diff * 10000n) / (ratioNum > ratioDen ? ratioNum : ratioDen);

    return new Percent(impactBps.toString(), "10000");
}
