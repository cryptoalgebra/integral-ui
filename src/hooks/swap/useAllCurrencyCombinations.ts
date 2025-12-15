import { BASES_TO_CHECK_TRADES_AGAINST, BOOSTED_TOKENS } from "config";
import { Currency, Token, BoostedToken, AnyToken } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { useChainId } from "wagmi";

function getAllBoostedTokens(token: AnyToken, chainId: number): BoostedToken[] {
    const boostedTokens = BOOSTED_TOKENS[chainId] || {};
    return Object.values(boostedTokens).filter((bt) => bt.underlying.equals(token));
}

/**
 * Generates all unique token pair combinations for trade routing.
 * Includes base pairs, boosted pairs, and intermediate hops through base tokens.
 */
export function useAllCurrencyCombinations(currencyA?: Currency, currencyB?: Currency): [AnyToken, AnyToken][] {
    const chainId = useChainId();

    const [tokenA, tokenB] = chainId ? [currencyA?.wrapped, currencyB?.wrapped] : [undefined, undefined];

    const bases: Token[] = useMemo(() => BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? [], [chainId]);

    // Find all boosted tokens for each input token
    const boostedTokensA = useMemo(() => (tokenA ? getAllBoostedTokens(tokenA, chainId) : []), [tokenA, chainId]);
    const boostedTokensB = useMemo(() => (tokenB ? getAllBoostedTokens(tokenB, chainId) : []), [tokenB, chainId]);

    return useMemo(() => {
        if (!tokenA || !tokenB) return [];

        const pairs: [AnyToken, AnyToken][] = [
            // Direct pair: tokenA <-> tokenB
            [tokenA, tokenB],

            // Boosted pairs: all combinations of boostedA <-> boostedB
            ...boostedTokensA.flatMap((boostedA) => boostedTokensB.map((boostedB): [AnyToken, AnyToken] => [boostedA, boostedB])),

            // Hop pairs through base tokens
            ...bases.flatMap((base): [AnyToken, AnyToken][] => [
                [tokenA, base],
                [tokenB, base],
            ]),

            // Boosted hop pairs: all boosted tokens through base tokens
            ...boostedTokensA.flatMap((boostedA) => bases.map((base): [AnyToken, AnyToken] => [boostedA, base])),
            ...boostedTokensB.flatMap((boostedB) => bases.map((base): [AnyToken, AnyToken] => [boostedB, base])),
        ];

        // Remove duplicate and self-referencing pairs
        const uniquePairs = pairs.filter(([t0, t1], index, allPairs) => {
            // Skip self-referencing pairs
            if (t0.equals(t1)) return false;

            // Keep only the first occurrence of each unique pair (considering order doesn't matter)
            const firstIndex = allPairs.findIndex(([a, b]) => (t0.equals(a) && t1.equals(b)) || (t0.equals(b) && t1.equals(a)));
            return firstIndex === index;
        });

        return uniquePairs;
    }, [tokenA, tokenB, boostedTokensA, boostedTokensB, bases]);
}
