import { BoostedSwapType, determineSwapType, canPoolBeUsedForSwapType } from "@cryptoalgebra/omega-router-sdk";
import { BoostedRoute, Currency, Pool, Route } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { useSwapPools } from "./useSwapPools";
import { useChainId } from "wagmi";

// Helper to create unique key for route
function getRouteKey(pools: Pool[], input: Currency, output: Currency): string {
    return `${input.wrapped.address}-${pools.map((p) => `${p.token0.address}-${p.token1.address}-${p.deployer}`).join("-")}-${
        output.wrapped.address
    }`;
}

/**
 * Compute boosted routes between input and output currencies
 *
 * Handles 6 boosted swap types:
 * - WRAP_ONLY: underlying → boosted (no pool)
 * - UNWRAP_ONLY: boosted → underlying (no pool)
 * - UNDERLYING_TO_UNDERLYING: underlying → pool → underlying
 * - UNDERLYING_TO_BOOSTED: underlying → pool → boosted
 * - BOOSTED_TO_UNDERLYING: boosted → pool → underlying
 * - BOOSTED_TO_BOOSTED: boosted → pool → boosted
 */
function computeBoostedRoutes(
    currencyIn: Currency,
    currencyOut: Currency,
    pools: Pool[],
    swapType: BoostedSwapType
): BoostedRoute<Currency, Currency>[] {
    const tokenIn = currencyIn.wrapped;
    const tokenOut = currencyOut.wrapped;
    const boostedRoutes: BoostedRoute<Currency, Currency>[] = [];
    const seenRoutes = new Set<string>();

    // ═══════════════════════════════════════════════════════════
    // CASE 1: WRAP_ONLY (no pools needed)
    // ═══════════════════════════════════════════════════════════
    if (swapType === BoostedSwapType.WRAP_ONLY) {
        try {
            const route = new BoostedRoute([], currencyIn, currencyOut);
            const key = `WRAP_ONLY-${tokenIn.address}-${tokenOut.address}`;
            if (!seenRoutes.has(key)) {
                boostedRoutes.push(route);
                seenRoutes.add(key);
            }
        } catch (e) {
            console.error("Failed to create WRAP_ONLY route:", e);
        }
        return boostedRoutes;
    }

    // ═══════════════════════════════════════════════════════════
    // CASE 2: UNWRAP_ONLY (no pools needed)
    // ═══════════════════════════════════════════════════════════
    if (swapType === BoostedSwapType.UNWRAP_ONLY) {
        try {
            const route = new BoostedRoute([], currencyIn, currencyOut);
            const key = `UNWRAP_ONLY-${tokenIn.address}-${tokenOut.address}`;
            if (!seenRoutes.has(key)) {
                boostedRoutes.push(route);
                seenRoutes.add(key);
            }
        } catch (e) {
            console.error("Failed to create UNWRAP_ONLY route:", e);
        }
        return boostedRoutes;
    }

    // ═══════════════════════════════════════════════════════════
    // CASE 3: BOOSTED swaps through pools
    // ═══════════════════════════════════════════════════════════
    for (const pool of pools) {
        try {
            if (canPoolBeUsedForSwapType(pool, tokenIn, tokenOut, swapType)) {
                const key = getRouteKey([pool], currencyIn, currencyOut);
                if (!seenRoutes.has(key)) {
                    const route = new BoostedRoute([pool], currencyIn, currencyOut);
                    boostedRoutes.push(route);
                    seenRoutes.add(key);
                }
            }
        } catch (e) {
            // Skip invalid routes
        }
    }

    return boostedRoutes;
}

/**
 * Compute regular (non-boosted) routes between input and output currencies
 *
 * Handles:
 * - Direct routes (1 hop): tokenIn → pool → tokenOut
 * - Multi-hop routes (2+ hops): tokenIn → pool1 → intermediateToken → pool2 → tokenOut
 */
function computeRegularRoutes(currencyIn: Currency, currencyOut: Currency, pools: Pool[]): Route<Currency, Currency>[] {
    const tokenIn = currencyIn.wrapped;
    const tokenOut = currencyOut.wrapped;
    const normalRoutes: Route<Currency, Currency>[] = [];
    const seenRoutes = new Set<string>();

    // 1 hop
    for (const pool of pools) {
        try {
            const matchesDirectly =
                (pool.token0.equals(tokenIn) && pool.token1.equals(tokenOut)) ||
                (pool.token0.equals(tokenOut) && pool.token1.equals(tokenIn));

            if (matchesDirectly) {
                const key = getRouteKey([pool], currencyIn, currencyOut);
                if (!seenRoutes.has(key)) {
                    const route = new Route([pool], currencyIn, currencyOut);
                    normalRoutes.push(route);
                    seenRoutes.add(key);
                }
            }
        } catch (e) {
            // Skip invalid routes
        }
    }

    // 2 hop
    const poolsWithTokenIn = pools.filter((pool) => pool.token0.equals(tokenIn) || pool.token1.equals(tokenIn));

    // For each pool connected to tokenIn, find pools that connect to tokenOut
    for (const firstPool of poolsWithTokenIn) {
        // Get the intermediate token (the other token in the first pool)
        const intermediateToken = firstPool.token0.equals(tokenIn) ? firstPool.token1 : firstPool.token0;

        // Skip if intermediate token is the same as output (would be direct route)
        if (intermediateToken.equals(tokenOut)) continue;

        // Find pools that connect intermediate token to tokenOut
        for (const secondPool of pools) {
            // Skip same pool
            if (firstPool === secondPool) continue;

            try {
                const connectsToOutput =
                    (secondPool.token0.equals(intermediateToken) && secondPool.token1.equals(tokenOut)) ||
                    (secondPool.token1.equals(intermediateToken) && secondPool.token0.equals(tokenOut));

                if (connectsToOutput) {
                    const key = getRouteKey([firstPool, secondPool], currencyIn, currencyOut);
                    if (!seenRoutes.has(key)) {
                        const route = new Route([firstPool, secondPool], currencyIn, currencyOut);
                        normalRoutes.push(route);
                        seenRoutes.add(key);
                    }
                }
            } catch (e) {
                // Skip invalid routes
            }
        }
    }

    return normalRoutes;
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

        const tokenIn = currencyIn.wrapped;
        const tokenOut = currencyOut.wrapped;

        // Determine swap type
        const swapType = determineSwapType(tokenIn, tokenOut);

        return {
            normalRoutes: computeRegularRoutes(currencyIn, currencyOut, pools),
            boostedRoutes: computeBoostedRoutes(currencyIn, currencyOut, pools, swapType),
        };
    }, [chainId, currencyIn, currencyOut, pools, poolsLoading]);

    console.log("[COMPUTED ROUTES]", { normalRoutes, boostedRoutes });

    return {
        normalRoutes,
        boostedRoutes,
        loading: poolsLoading,
    };
}
