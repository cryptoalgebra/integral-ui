import { Pool, Token } from "@cryptoalgebra/custom-pools-sdk";
import { BoostedToken } from "sdk-updates/boostedToken";

/**
 * Boosted Swap Type Classification
 * This covers all swap types involving ERC4626 tokens (BoostedTokens)
 */
export enum BoostedSwapType {
    // ═══════════════════════════════════════════════════════════
    // GROUP A: DIRECT WRAP/UNWRAP (no pools needed)
    // ═══════════════════════════════════════════════════════════

    /**
     * Type 2 & 8 from requirements:
     * - USDC → sparkUSDC (Underlying → ERC4626)
     * - ETH → mwETH (Native → ERC4626, after WETH wrap)
     *
     * Characteristics:
     * - pools.length === 0
     * - tokenPath = [underlying, boosted]
     * - Only ERC4626 deposit needed
     */
    WRAP_ONLY = "WRAP_ONLY",

    /**
     * Type 3 & 9 from requirements:
     * - sparkUSDC → USDC (ERC4626 → Underlying)
     * - mwETH → ETH (ERC4626 → Native, before WETH unwrap)
     *
     * Characteristics:
     * - pools.length === 0
     * - tokenPath = [boosted, underlying]
     * - Only ERC4626 redeem needed
     */
    UNWRAP_ONLY = "UNWRAP_ONLY",

    // ═══════════════════════════════════════════════════════════
    // GROUP B: SINGLE-HOP THROUGH BOOSTED POOL
    // ═══════════════════════════════════════════════════════════

    /**
     * Type 1, 6, 7 from requirements:
     * - USDC → [sparkUSDC/mwETH pool] → WETH
     * - ETH → [mwETH/sparkUSDC pool] → USDC (with WETH wrap at start)
     * - USDC → [sparkUSDC/mwETH pool] → ETH (with WETH unwrap at end)
     *
     * Characteristics:
     * - pools.length === 1
     * - Both input and output are underlying (not boosted)
     * - tokenPath = [underlyingIn, boostedIn, boostedOut, underlyingOut]
     * - Requires: wrap → swap → unwrap
     */
    UNDERLYING_TO_UNDERLYING = "UNDERLYING_TO_UNDERLYING",

    /**
     * Underlying → Boosted through pool (not direct wrap):
     * - USDC → [sparkUSDC/mwETH pool] → mwETH (stops at boosted, no final unwrap)
     *
     * Characteristics:
     * - pools.length === 1
     * - Input is underlying, output is boosted (but NOT direct wrap relationship)
     * - tokenPath = [underlyingIn, boostedIn, boostedOut]
     * - Requires: wrap → swap (no final unwrap)
     */
    UNDERLYING_TO_BOOSTED = "UNDERLYING_TO_BOOSTED",

    /**
     * Boosted → Underlying through pool (not direct unwrap):
     * - mwETH → [sparkUSDC/mwETH pool] → USDC (unwrap after swap)
     *
     * Characteristics:
     * - pools.length === 1
     * - Input is boosted, output is underlying (but NOT direct unwrap relationship)
     * - tokenPath = [boostedIn, boostedOut, underlyingOut]
     * - Requires: swap → unwrap (no initial wrap)
     */
    BOOSTED_TO_UNDERLYING = "BOOSTED_TO_UNDERLYING",

    /**
     * Type 4 from requirements:
     * - sparkUSDC → [sparkUSDC/mwETH pool] → mwETH
     *
     * Characteristics:
     * - pools.length === 1
     * - Both input and output are boosted tokens
     * - tokenPath = [boostedIn, ..., boostedOut]
     * - Pool swap between two ERC4626 tokens
     */
    BOOSTED_TO_BOOSTED = "BOOSTED_TO_BOOSTED",

    // ═══════════════════════════════════════════════════════════
    // NOT A BOOSTED SWAP
    // ═══════════════════════════════════════════════════════════

    /**
     * Type 5 from requirements:
     * - USDC → DAI (Underlying → Underlying, no boosted pool)
     *
     * This should use normal Route, not BoostedRoute
     */
    NORMAL = "NORMAL",
}

/**
 * Helper: Check if token is a BoostedToken (ERC4626)
 */
export function isBoostedToken(token: Token): token is BoostedToken {
    return token instanceof BoostedToken;
}

/**
 * Step 1: Determine swap type based on input/output tokens
 *
 * This is the FIRST step in routing logic.
 * It tells us what kind of swap we're dealing with.
 */
export function determineSwapType(tokenIn: Token, tokenOut: Token): BoostedSwapType {
    const inputIsBoosted = isBoostedToken(tokenIn);
    const outputIsBoosted = isBoostedToken(tokenOut);

    // ═══════════════════════════════════════════════════════════
    // CASE 1: WRAP_ONLY (underlying → its boosted version)
    // ═══════════════════════════════════════════════════════════
    if (!inputIsBoosted && outputIsBoosted) {
        // Check if output wraps input (e.g., USDC → sparkUSDC)
        if (tokenOut.underlying.equals(tokenIn)) {
            return BoostedSwapType.WRAP_ONLY;
        }

        // If not direct wrap, it's underlying → other boosted (needs pool)
        // Example: USDC → mwETH (where mwETH.underlying is WETH, not USDC)
        return BoostedSwapType.UNDERLYING_TO_BOOSTED;
    }

    // ═══════════════════════════════════════════════════════════
    // CASE 2: UNWRAP_ONLY (boosted → its underlying)
    // ═══════════════════════════════════════════════════════════
    if (inputIsBoosted && !outputIsBoosted) {
        // Check if input unwraps to output (e.g., sparkUSDC → USDC)
        if (tokenIn.underlying.equals(tokenOut)) {
            return BoostedSwapType.UNWRAP_ONLY;
        }

        // If not direct unwrap, it's boosted → other underlying (needs pool)
        // Example: mwETH → USDC (where mwETH.underlying is WETH, not USDC)
        return BoostedSwapType.BOOSTED_TO_UNDERLYING;
    }

    // ═══════════════════════════════════════════════════════════
    // CASE 3: UNDERLYING_TO_UNDERLYING (both underlying, need pool)
    // ═══════════════════════════════════════════════════════════
    if (!inputIsBoosted && !outputIsBoosted) {
        // Both are underlying tokens
        // Need to check if there's a boosted pool connecting them
        // If no boosted pool exists, this will be NORMAL
        // We'll determine this later when we look at available pools
        return BoostedSwapType.UNDERLYING_TO_UNDERLYING;
    }

    // ═══════════════════════════════════════════════════════════
    // CASE 4: BOOSTED_TO_BOOSTED (both are ERC4626)
    // ═══════════════════════════════════════════════════════════
    if (inputIsBoosted && outputIsBoosted) {
        return BoostedSwapType.BOOSTED_TO_BOOSTED;
    }

    // Should never reach here
    return BoostedSwapType.NORMAL;
}

/**
 * Step 2: Check if a pool can be used for a specific swap type
 *
 * This validates that the pool actually has the tokens we need
 * for the swap type we're trying to execute.
 */
export function canPoolBeUsedForSwapType(pool: Pool, tokenIn: Token, tokenOut: Token, swapType: BoostedSwapType): boolean {
    const pool0IsBoosted = isBoostedToken(pool.token0);
    const pool1IsBoosted = isBoostedToken(pool.token1);

    // Pool must have at least one boosted token
    if (!pool0IsBoosted && !pool1IsBoosted) {
        return false;
    }

    switch (swapType) {
        // ═══════════════════════════════════════════════════════════
        // WRAP_ONLY & UNWRAP_ONLY don't need pools
        // ═══════════════════════════════════════════════════════════
        case BoostedSwapType.WRAP_ONLY:
        case BoostedSwapType.UNWRAP_ONLY:
            return false; // These types never use pools

        // ═══════════════════════════════════════════════════════════
        // UNDERLYING_TO_UNDERLYING: USDC → [sparkUSDC/mwETH] → WETH
        // ═══════════════════════════════════════════════════════════
        case BoostedSwapType.UNDERLYING_TO_UNDERLYING: {
            // We need to find boosted versions of input and output in the pool
            // Example: for USDC → WETH, pool should have sparkUSDC and mwETH

            // Find if pool has a boosted token whose underlying is tokenIn
            const hasBoostedInput =
                (pool0IsBoosted && (pool.token0 as BoostedToken).underlying.equals(tokenIn)) ||
                (pool1IsBoosted && (pool.token1 as BoostedToken).underlying.equals(tokenIn));

            // Find if pool has a boosted token whose underlying is tokenOut
            const hasBoostedOutput =
                (pool0IsBoosted && (pool.token0 as BoostedToken).underlying.equals(tokenOut)) ||
                (pool1IsBoosted && (pool.token1 as BoostedToken).underlying.equals(tokenOut));

            return hasBoostedInput && hasBoostedOutput;
        }

        // ═══════════════════════════════════════════════════════════
        // UNDERLYING_TO_BOOSTED: USDC → [sparkUSDC/mwETH] → mwETH
        // ═══════════════════════════════════════════════════════════
        case BoostedSwapType.UNDERLYING_TO_BOOSTED: {
            // Pool must have:
            // 1. A boosted token whose underlying is tokenIn (for wrap)
            // 2. The tokenOut itself (which is already boosted)

            const hasBoostedInput =
                (pool0IsBoosted && (pool.token0 as BoostedToken).underlying.equals(tokenIn)) ||
                (pool1IsBoosted && (pool.token1 as BoostedToken).underlying.equals(tokenIn));

            const hasOutputToken = pool.token0.equals(tokenOut) || pool.token1.equals(tokenOut);

            return hasBoostedInput && hasOutputToken;
        }

        // ═══════════════════════════════════════════════════════════
        // BOOSTED_TO_UNDERLYING: mwETH → [mwETH/sparkUSDC] → USDC
        // ═══════════════════════════════════════════════════════════
        case BoostedSwapType.BOOSTED_TO_UNDERLYING: {
            // Pool must have:
            // 1. The tokenIn itself (which is already boosted)
            // 2. A boosted token whose underlying is tokenOut (for unwrap)

            const hasInputToken = pool.token0.equals(tokenIn) || pool.token1.equals(tokenIn);

            const hasBoostedOutput =
                (pool0IsBoosted && (pool.token0 as BoostedToken).underlying.equals(tokenOut)) ||
                (pool1IsBoosted && (pool.token1 as BoostedToken).underlying.equals(tokenOut));

            return hasInputToken && hasBoostedOutput;
        }

        // ═══════════════════════════════════════════════════════════
        // BOOSTED_TO_BOOSTED: sparkUSDC → [sparkUSDC/mwETH] → mwETH
        // ═══════════════════════════════════════════════════════════
        case BoostedSwapType.BOOSTED_TO_BOOSTED: {
            // Pool must have both tokenIn and tokenOut (both are boosted)
            const hasInput = pool.token0.equals(tokenIn) || pool.token1.equals(tokenIn);
            const hasOutput = pool.token0.equals(tokenOut) || pool.token1.equals(tokenOut);

            return hasInput && hasOutput;
        }

        // ═══════════════════════════════════════════════════════════
        // NORMAL routes don't use boosted pools
        // ═══════════════════════════════════════════════════════════
        case BoostedSwapType.NORMAL:
            return false;

        default:
            return false;
    }
}
