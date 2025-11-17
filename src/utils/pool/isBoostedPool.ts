import { Pool } from "@cryptoalgebra/custom-pools-sdk";

/**
 * Checks whether a given pool contains at least one "boosted" (ERC-4626) token.
 *
 * @param pool The pool instance to check.
 * @returns `true` if the pool contains at least one boosted token, otherwise `false`.
 */
export const isBoostedPool = (pool: Pool) => {
    return pool.token0.isBoosted || pool.token1.isBoosted;
};
