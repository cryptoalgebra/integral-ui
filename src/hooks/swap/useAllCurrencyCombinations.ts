import { BASES_TO_CHECK_TRADES_AGAINST, BOOSTED_TOKENS } from "config";
import { Currency, Token, BoostedToken, AnyToken } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { useChainId } from "wagmi";
import { isDefined } from "@/utils";

const getBoostedToken = (token: AnyToken): BoostedToken | undefined => {
    const chainId = token.chainId;
    const boostedTokens = BOOSTED_TOKENS[chainId] || {};
    return Object.values(boostedTokens).find((bt) => bt.underlying.equals(token));
};

export function useAllCurrencyCombinations(currencyA?: Currency, currencyB?: Currency) {
    const chainId = useChainId();

    const [tokenA, tokenB] = chainId ? [currencyA?.wrapped, currencyB?.wrapped] : [undefined, undefined];

    // Find matching boosted tokens that have the same underlying
    const [boostedA, boostedB] = useMemo(() => {
        if (!tokenA || !tokenB) return [];
        return [getBoostedToken(tokenA), getBoostedToken(tokenB)];
    }, [tokenA, tokenB]);

    const bases: Token[] = useMemo(() => BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? [], [chainId]);

    const boostedBases: BoostedToken[] = useMemo(() => bases.map((token) => getBoostedToken(token)).filter(isDefined), [bases]);

    // const basePairs: [Token, Token][] = useMemo(
    //     () => bases.flatMap((base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])).filter(([t0, t1]) => !t0.equals(t1)),
    //     [bases]
    // );

    return useMemo(() => {
        if (!tokenA || !tokenB) return [];

        const pairs: AnyToken[][] = [
            // Base pair
            [tokenA, tokenB],

            // Boosted pair
            ...(boostedA && boostedB ? [[boostedA, boostedB]] : []),

            // Hop with bases
            ...bases.map((base) => [tokenA, base]),
            ...bases.map((base) => [tokenB, base]),

            // Hop with boosted bases
            ...boostedBases.map((base) => [tokenA, base]),
            ...boostedBases.map((base) => [tokenB, base]),

            // Boosted hop with bases
            ...(boostedA ? bases.map((base) => [boostedA, base]) : []),
            ...(boostedB ? bases.map((base) => [boostedB, base]) : []),

            // Boosted hop with boosted bases
            ...(boostedA ? boostedBases.map((base) => [boostedA, base]) : []),
            ...(boostedB ? boostedBases.map((base) => [boostedB, base]) : []),
        ];

        const filtered = pairs
            .filter(([t0, t1]) => !t0.equals(t1))
            .filter(([t0, t1], i, otherPairs) => {
                const firstIndexInOtherPairs = otherPairs.findIndex(
                    ([t0Other, t1Other]) => (t0.equals(t0Other) && t1.equals(t1Other)) || (t0.equals(t1Other) && t1.equals(t0Other))
                );
                return firstIndexInOtherPairs === i;
            });

        return filtered;
    }, [tokenA, tokenB, boostedA, boostedB, bases, boostedBases]);
}
