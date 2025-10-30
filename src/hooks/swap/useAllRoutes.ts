import { Currency, Pool, Route } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { useSwapPools } from "./useSwapPools";
import { useChainId } from "wagmi";
import { getBoostedToken } from "config/tokens";
import { BoostedRoute } from "sdk-updates/boostedRoute";
import { isBoostedPool } from "@/utils/pool/isBoostedPool";
import { BoostedToken } from "sdk-updates/boostedToken";

function poolEquals(poolA: Pool, poolB: Pool): boolean {
    return poolA === poolB || (poolA.token0.equals(poolB.token0) && poolA.token1.equals(poolB.token1));
}

/**
 * Unified route computation that handles both normal and boosted pools
 * Returns both normal Routes and BoostedRoutes
 */
function computeAllRoutes(
    currencyIn: Currency,
    currencyOut: Currency,
    pools: Pool[],
    chainId: number,
    currentPath: Pool[] = [],
    hasBoostedPool = false,
    startCurrencyIn: Currency = currencyIn,
    maxHops = 3
): { normalRoutes: Route<Currency, Currency>[]; boostedRoutes: BoostedRoute<Currency, Currency>[] } {
    const normalRoutes: Route<Currency, Currency>[] = [];
    const boostedRoutes: BoostedRoute<Currency, Currency>[] = [];

    const tokenIn = currencyIn?.wrapped;
    const tokenOut = currencyOut?.wrapped;

    if (!tokenIn || !tokenOut) return { normalRoutes, boostedRoutes };

    for (const pool of pools) {
        if (currentPath.some((p) => poolEquals(p, pool))) continue;

        const isBoosted = isBoostedPool(pool);
        const pathHasBoosted = hasBoostedPool || isBoosted;

        // For boosted pools, check if we can connect via boosted token wrapper
        let canConnect = false;
        let nextToken = null;

        if (isBoosted) {
            // Try to connect via boosted token
            const boostedIn = getBoostedToken(tokenIn);
            if (boostedIn && pool.involvesToken(boostedIn)) {
                canConnect = true;
                nextToken = pool.token0.equals(boostedIn) ? pool.token1 : pool.token0;
            }
        } else {
            // Normal pool connection
            if (pool.involvesToken(tokenIn)) {
                canConnect = true;
                nextToken = pool.token0.equals(tokenIn) ? pool.token1 : pool.token0;
            }
        }

        if (!canConnect || !nextToken) continue;

        // Check if we reached the destination
        const reachedDestination = isBoosted
            ? nextToken instanceof BoostedToken
                ? nextToken.underlying.equals(tokenOut)
                : getBoostedToken(tokenOut)?.equals(nextToken)
            : nextToken.equals(tokenOut);

        if (reachedDestination) {
            const newPath = [...currentPath, pool];

            if (pathHasBoosted) {
                // Create BoostedRoute if path contains at least one boosted pool
                boostedRoutes.push(new BoostedRoute(newPath, startCurrencyIn, currencyOut));
            } else {
                // Create normal Route if no boosted pools in path
                normalRoutes.push(new Route(newPath, startCurrencyIn, currencyOut));
            }
        } else if (maxHops > 1) {
            // Continue searching with the next token
            const nextCurrency = nextToken instanceof BoostedToken ? nextToken.underlying : nextToken;

            const subRoutes = computeAllRoutes(
                nextCurrency,
                currencyOut,
                pools,
                chainId,
                [...currentPath, pool],
                pathHasBoosted,
                startCurrencyIn,
                maxHops - 1
            );

            normalRoutes.push(...subRoutes.normalRoutes);
            boostedRoutes.push(...subRoutes.boostedRoutes);
        }
    }

    return { normalRoutes, boostedRoutes };
}

/** ────────────────────────────────
 * HOOK
 * ──────────────────────────────── */
export function useAllRoutes(
    currencyIn?: Currency,
    currencyOut?: Currency
): {
    loading: boolean;
    boostedRoutes: BoostedRoute<Currency, Currency>[];
    normalRoutes: Route<Currency, Currency>[];
} {
    const chainId = useChainId();
    const { pools, isLoading: poolsLoading } = useSwapPools(currencyIn, currencyOut);

    const { normalRoutes, boostedRoutes } = useMemo(() => {
        if (poolsLoading || !chainId || !pools || !currencyIn || !currencyOut)
            return {
                normalRoutes: [],
                boostedRoutes: [],
            };

        const routes = computeAllRoutes(currencyIn, currencyOut, pools, chainId, [], false, currencyIn, 1);

        return {
            normalRoutes: routes.normalRoutes,
            boostedRoutes: routes.boostedRoutes,
        };
    }, [chainId, currencyIn, currencyOut, pools, poolsLoading]);

    return {
        normalRoutes,
        boostedRoutes,
        loading: poolsLoading,
    };
}
