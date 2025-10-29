import { Currency, Pool, Route } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { useSwapPools } from "./useSwapPools";
import { useChainId } from "wagmi";
import { BOOSTED_TOKEN_MAPPING } from "config/tokens";

/**
 * Returns true if poolA is equivalent to poolB
 * @param poolA one of the two pools
 * @param poolB the other pool
 */
function poolEquals(poolA: Pool, poolB: Pool): boolean {
    return poolA === poolB || (poolA.token0.equals(poolB.token0) && poolA.token1.equals(poolB.token1));
}

function computeAllRoutes(
    currencyIn: Currency,
    currencyOut: Currency,
    pools: Pool[],
    chainId: number,
    currentPath: Pool[] = [],
    allPaths: Route<Currency, Currency>[] = [],
    startCurrencyIn: Currency = currencyIn,
    maxHops = 2
): Route<Currency, Currency>[] {
    const tokenIn = currencyIn?.wrapped;
    const tokenOut = currencyOut?.wrapped;

    if (!tokenIn || !tokenOut) throw new Error("Missing tokenIn/tokenOut");

    for (const pool of pools) {
        try {
            if (!pool.involvesToken(tokenIn) || currentPath.find((pathPool) => poolEquals(pool, pathPool))) continue;

            const outputToken = pool.token0.equals(tokenIn) ? pool.token1 : pool.token0;
            if (outputToken.equals(tokenOut)) {
                allPaths.push(new Route([...currentPath, pool], startCurrencyIn, currencyOut));
            } else if (maxHops > 1) {
                computeAllRoutes(outputToken, currencyOut, pools, chainId, [...currentPath, pool], allPaths, startCurrencyIn, maxHops - 1);
            }
        } catch (e) {
            console.error(e);
            continue;
        }
    }

    return allPaths;
}

/**
 * Returns all the routes from an input currency to an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useAllRoutes(currencyIn?: Currency, currencyOut?: Currency): { loading: boolean; routes: Route<Currency, Currency>[] } {
    const chainId = useChainId();

    const { pools, isLoading: poolsLoading } = useSwapPools(currencyIn, currencyOut);

    return useMemo(() => {
        if (poolsLoading || !chainId || !pools || !currencyIn || !currencyOut)
            return {
                loading: true,
                routes: [],
            };

        const boostedTokenMapping = BOOSTED_TOKEN_MAPPING[chainId];

        // Получаем все возможные пути со всеми пулами (включая boosted)
        const allRoutes = computeAllRoutes(currencyIn, currencyOut, pools, chainId, [], [], currencyIn, 1);

        if (!boostedTokenMapping) return { loading: false, routes: allRoutes };

        // Для каждого маршрута проверяем, содержит ли он бустед пулы
        // Если да, то создаем новый Route с теми же пулами, но с underlying токенами как вход/выход
        const processedRoutes = allRoutes.map((route) => {
            const hasBoostedPools = route.pools.some((pool) => {
                const token0Mapping = boostedTokenMapping[pool.token0.address];
                const token1Mapping = boostedTokenMapping[pool.token1.address];
                return token0Mapping?.wrapped.equals(pool.token0) || token1Mapping?.wrapped.equals(pool.token1);
            });

            if (hasBoostedPools) {
                // Находим underlying токены для входа и выхода
                const underlyingIn = boostedTokenMapping[currencyIn.wrapped.address]?.underlying || currencyIn;
                const underlyingOut = boostedTokenMapping[currencyOut.wrapped.address]?.underlying || currencyOut;

                // Создаем новый Route с теми же пулами, но с underlying токенами
                return new Route(route.pools, underlyingIn, underlyingOut);
            }

            return route;
        });

        return {
            loading: false,
            routes: processedRoutes,
        };
    }, [chainId, currencyIn, currencyOut, pools, poolsLoading]);
}
