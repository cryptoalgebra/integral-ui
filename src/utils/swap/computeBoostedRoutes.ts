import { AnyToken, BoostedToken, Currency, Pool, BoostedRoute } from "@cryptoalgebra/custom-pools-sdk";

/**
 * Check if tokenIn can reach tokenOut via wrap or unwrap (no pool needed)
 */
function isDirectWrapUnwrap(tokenIn: AnyToken, tokenOut: AnyToken): boolean {
    // WRAP: underlying → boosted
    if (!tokenIn.isBoosted && tokenOut.isBoosted) {
        return (tokenOut as BoostedToken).underlying.equals(tokenIn);
    }
    // UNWRAP: boosted → underlying
    if (tokenIn.isBoosted && !tokenOut.isBoosted) {
        return (tokenIn as BoostedToken).underlying.equals(tokenOut);
    }
    return false;
}

/**
 * Check if a pool can connect tokenIn to tokenOut (directly or via wrap/unwrap)
 */
function canPoolConnect(pool: Pool, tokenIn: AnyToken, tokenOut: AnyToken): boolean {
    const { token0, token1 } = pool;

    // Get all possible input tokens (tokenIn + its boosted/underlying versions)
    const inputVariants = getTokenVariantsWithPool(tokenIn, pool);
    // Get all possible output tokens (tokenOut + its boosted/underlying versions)
    const outputVariants = getTokenVariantsWithPool(tokenOut, pool);

    // Check if pool connects any input variant to any output variant
    for (const inVar of inputVariants) {
        for (const outVar of outputVariants) {
            if ((token0.equals(inVar) && token1.equals(outVar)) || (token1.equals(inVar) && token0.equals(outVar))) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Get token and its boosted/underlying variants
 */
function getTokenVariants(token: AnyToken): AnyToken[] {
    const variants: AnyToken[] = [token];

    if (token.isBoosted && (token as BoostedToken).underlying) {
        variants.push((token as BoostedToken).underlying);
    }

    return variants;
}

/**
 * Get token variants including boosted versions from the specific pool
 * This checks if pool tokens are boosted versions of the given token
 */
function getTokenVariantsWithPool(token: AnyToken, pool: Pool): AnyToken[] {
    const variants: AnyToken[] = [token];

    // If token is boosted, add its underlying
    if (token.isBoosted && (token as BoostedToken).underlying) {
        variants.push((token as BoostedToken).underlying);
    }

    // Check if pool tokens are boosted versions of this token
    if (pool.token0.isBoosted && (pool.token0 as BoostedToken).underlying?.equals(token)) {
        variants.push(pool.token0);
    }
    if (pool.token1.isBoosted && (pool.token1 as BoostedToken).underlying?.equals(token)) {
        variants.push(pool.token1);
    }

    return variants;
}

/**
 * Get boosted variants for a token from available pools
 */
function getBoostedVariantsFromPools(token: AnyToken, pools: Pool[]): AnyToken[] {
    const variants: AnyToken[] = [];

    for (const pool of pools) {
        if (pool.token0.isBoosted && (pool.token0 as BoostedToken).underlying?.equals(token)) {
            variants.push(pool.token0);
        }
        if (pool.token1.isBoosted && (pool.token1 as BoostedToken).underlying?.equals(token)) {
            variants.push(pool.token1);
        }
    }

    return variants;
}

/**
 * Check if pool has both tokens as boosted or both as non-boosted
 */
function isBothBoostedPool(pool: Pool): boolean {
    return (pool.token0.isBoosted && pool.token1.isBoosted) || (!pool.token0.isBoosted && !pool.token1.isBoosted);
}

/**
 * Compute boosted routes between input and output currencies
 */
export function computeBoostedRoutes(
    currencyIn: Currency,
    currencyOut: Currency,
    pools: Pool[],
    exactInput: boolean
): BoostedRoute<Currency, Currency>[] {
    const tokenIn = currencyIn.wrapped;
    const tokenOut = currencyOut.wrapped;
    const boostedRoutes: BoostedRoute<Currency, Currency>[] = [];

    // Filter only pools where BOTH tokens are boosted
    const boostedPools = pools.filter(isBothBoostedPool);

    // ═══════════════════════════════════════════════════════════
    // CASE 1: Direct WRAP / UNWRAP (no pools needed)
    // ═══════════════════════════════════════════════════════════
    if (isDirectWrapUnwrap(tokenIn, tokenOut)) {
        try {
            boostedRoutes.push(new BoostedRoute([], currencyIn, currencyOut));
        } catch (e) {
            console.error("Failed to create wrap/unwrap route:", e);
        }
        return boostedRoutes;
    }

    // ═══════════════════════════════════════════════════════════
    // CASE 2: Single-hop through one boosted pool
    // ═══════════════════════════════════════════════════════════
    for (const pool of boostedPools) {
        if (!canPoolConnect(pool, tokenIn, tokenOut)) continue;

        try {
            const route = new BoostedRoute([pool], currencyIn, currencyOut);

            // Only include if route has WRAP or UNWRAP step (otherwise it's not a boosted route)
            const hasWrapOrUnwrap = route.steps.some((step) => step.type === "WRAP" || step.type === "UNWRAP");
            if (!hasWrapOrUnwrap) continue;

            boostedRoutes.push(route);
        } catch {
            // Skip invalid routes
        }
    }

    // Multihop allowed only for exact input
    if (!exactInput) {
        return boostedRoutes;
    }

    // ═══════════════════════════════════════════════════════════
    // CASE 3: Two-hop through two boosted pools
    // Example: USDT → [wrap] → sparkUSDT → [pool1] → sparkUSDC → [pool2] → mwETH → [unwrap] → WETH
    // ═══════════════════════════════════════════════════════════

    // Get all input variants including boosted versions from pools
    const inputVariants = [...getTokenVariants(tokenIn), ...getBoostedVariantsFromPools(tokenIn, boostedPools)];

    for (const firstPool of boostedPools) {
        // Check if first pool connects to any input variant
        const poolTokens = [firstPool.token0, firstPool.token1];
        const matchingInput = inputVariants.find((v) => poolTokens.some((pt) => pt.equals(v)));
        if (!matchingInput) continue;

        // Get intermediate token from first pool
        const intermediate = firstPool.token0.equals(matchingInput) ? firstPool.token1 : firstPool.token0;

        // Skip if intermediate already leads to output (would be 1-hop)
        const intermediateVariants = [...getTokenVariants(intermediate), ...getBoostedVariantsFromPools(intermediate, boostedPools)];
        const outputVariants = [...getTokenVariants(tokenOut), ...getBoostedVariantsFromPools(tokenOut, boostedPools)];

        if (intermediateVariants.some((iv) => outputVariants.some((ov) => iv.equals(ov)))) continue;

        // Find second pool that connects intermediate to output
        for (const secondPool of boostedPools) {
            if (firstPool === secondPool) continue;

            // Check if second pool connects intermediate variants to output variants
            const secondPoolTokens = [secondPool.token0, secondPool.token1];
            const matchesIntermediate = intermediateVariants.some((iv) => secondPoolTokens.some((pt) => pt.equals(iv)));
            const matchesOutput = outputVariants.some((ov) => secondPoolTokens.some((pt) => pt.equals(ov)));

            if (!matchesIntermediate || !matchesOutput) continue;

            try {
                const route = new BoostedRoute([firstPool, secondPool], currencyIn, currencyOut);

                // Only include if route has WRAP or UNWRAP step (otherwise it's not a boosted route)
                const hasWrapOrUnwrap = route.steps.some((step) => step.type === "WRAP" || step.type === "UNWRAP");
                if (!hasWrapOrUnwrap) continue;

                boostedRoutes.push(route);
            } catch {
                // Skip invalid routes
            }
        }
    }

    return boostedRoutes;
}
