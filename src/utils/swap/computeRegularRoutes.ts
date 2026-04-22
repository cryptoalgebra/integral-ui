import { AnyToken, Currency, Pool, Route } from "@cryptoalgebra/integral-sdk";

const MAX_HOPS = 3;

function getNextToken(pool: Pool, currentToken: AnyToken): AnyToken | undefined {
    if (pool.token0.equals(currentToken)) return pool.token1;
    if (pool.token1.equals(currentToken)) return pool.token0;

    return undefined;
}

/**
 * Computes regular (non-boosted) routes between input and output currencies
 */
export function computeRegularRoutes(currencyIn: Currency, currencyOut: Currency, pools: Pool[]): Route<Currency, Currency>[] {
    const tokenIn = currencyIn.wrapped;
    const tokenOut = currencyOut.wrapped;
    const normalRoutes: Route<Currency, Currency>[] = [];
    const seenRoutes = new Set<string>();

    if (tokenIn.equals(tokenOut)) {
        return normalRoutes;
    }

    const walk = (currentToken: AnyToken, currentRoute: Pool[], visitedTokens: Set<string>, usedPoolIndexes: Set<number>) => {
        if (currentRoute.length >= MAX_HOPS) {
            return;
        }

        for (const [poolIndex, pool] of pools.entries()) {
            if (usedPoolIndexes.has(poolIndex)) continue;

            const nextToken = getNextToken(pool, currentToken);
            if (!nextToken) continue;

            const nextRoute = [...currentRoute, pool];

            if (nextToken.equals(tokenOut)) {
                try {
                    const routeKey = nextRoute.map((_, index) => `${index}:${pools.indexOf(nextRoute[index])}`).join("|");
                    if (seenRoutes.has(routeKey)) continue;

                    normalRoutes.push(new Route(nextRoute, currencyIn, currencyOut));
                    seenRoutes.add(routeKey);
                } catch {
                    // Skip invalid routes
                }

                continue;
            }

            const nextTokenKey = nextToken.address;
            if (visitedTokens.has(nextTokenKey)) continue;

            walk(nextToken, nextRoute, new Set(visitedTokens).add(nextTokenKey), new Set(usedPoolIndexes).add(poolIndex));
        }
    };

    walk(tokenIn, [], new Set([tokenIn.address]), new Set());

    return normalRoutes;
}
