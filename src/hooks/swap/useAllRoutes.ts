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
            console.log("CAN BE OR NOT", {
                pool,
                tokenIn,
                tokenOut,
                swapType,
                canBeUsed: canPoolBeUsedForSwapType(pool, tokenIn, tokenOut, swapType),
            });
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
 * Only handles NORMAL swap type (underlying → pool → underlying, no boosted tokens)
 */
function computeRegularRoutes(currencyIn: Currency, currencyOut: Currency, pools: Pool[]): Route<Currency, Currency>[] {
    const tokenIn = currencyIn.wrapped;
    const tokenOut = currencyOut.wrapped;
    const normalRoutes: Route<Currency, Currency>[] = [];
    const seenRoutes = new Set<string>();

    // Look for normal pools (non-boosted) connecting tokenIn and tokenOut
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

    console.log("pop", pools);

    console.log("[COMPUTED ROUTES]", { normalRoutes, boostedRoutes });

    return {
        normalRoutes,
        boostedRoutes,
        loading: poolsLoading,
    };
}
