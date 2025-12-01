import { Currency, Pool, Route } from "@cryptoalgebra/custom-pools-sdk";

/**
 * Computes regular (non-boosted) routes between input and output currencies
 */
export function computeRegularRoutes(currencyIn: Currency, currencyOut: Currency, pools: Pool[]): Route<Currency, Currency>[] {
    const tokenIn = currencyIn.wrapped;
    const tokenOut = currencyOut.wrapped;
    const normalRoutes: Route<Currency, Currency>[] = [];

    // 1 hop
    for (const pool of pools) {
        try {
            const matchesDirectly =
                (pool.token0.equals(tokenIn) && pool.token1.equals(tokenOut)) ||
                (pool.token0.equals(tokenOut) && pool.token1.equals(tokenIn));

            if (matchesDirectly) {
                const route = new Route([pool], currencyIn, currencyOut);
                normalRoutes.push(route);
            }
        } catch (e) {
            // Skip invalid routes
        }
    }

    // 2 hop
    const poolsWithTokenIn = pools.filter((pool) => pool.token0.equals(tokenIn) || pool.token1.equals(tokenIn));

    for (const firstPool of poolsWithTokenIn) {
        const intermediateToken = firstPool.token0.equals(tokenIn) ? firstPool.token1 : firstPool.token0;
        if (intermediateToken.equals(tokenOut)) continue;

        for (const secondPool of pools) {
            if (firstPool === secondPool) continue;

            try {
                const connectsToOutput =
                    (secondPool.token0.equals(intermediateToken) && secondPool.token1.equals(tokenOut)) ||
                    (secondPool.token1.equals(intermediateToken) && secondPool.token0.equals(tokenOut));

                if (connectsToOutput) {
                    const route = new Route([firstPool, secondPool], currencyIn, currencyOut);
                    normalRoutes.push(route);
                }
            } catch (e) {
                // Skip invalid routes
            }
        }
    }

    return normalRoutes;
}
