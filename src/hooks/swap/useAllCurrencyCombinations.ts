import { BASES_TO_CHECK_TRADES_AGAINST, BOOSTED_TOKENS } from "config";
import { Currency, Token, BoostedToken, AnyToken } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { useChainId } from "wagmi";

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
        return [getBoostedToken(tokenA)?.wrapped, getBoostedToken(tokenB)?.wrapped];
    }, [tokenA, tokenB]);

    const bases: (Token | BoostedToken)[] = useMemo(() => {
        if (!chainId) return [];

        const baseTokens = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? [];

        // Add wrapped versions of base tokens
        const boostedBaseTokens = baseTokens.map((token) => getBoostedToken(token)?.wrapped).filter((token): token is Token => !!token);

        return [...baseTokens, ...boostedBaseTokens];
    }, [chainId]);

    const basePairs: [Token, Token][] = useMemo(
        () => bases.flatMap((base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])).filter(([t0, t1]) => !t0.equals(t1)),
        [bases]
    );

    return useMemo(() => {
        if (!tokenA || !tokenB) return [];

        const pairs: (Token | BoostedToken)[][] = [
            // Базовая пара
            [tokenA, tokenB],

            // Если есть wrapped версии обоих токенов, добавляем пару wrapped токенов
            ...(boostedA && boostedB ? [[boostedA, boostedB] as [Token, Token]] : []),

            // Комбинации с базовыми токенами
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            ...bases.map((base): [Token, Token] => [tokenB, base]),

            // Если есть wrapped версии, добавляем комбинации с ними
            ...(boostedA ? bases.map((base): [Token, Token] => [boostedA, base]) : []),
            ...(boostedB ? bases.map((base): [Token, Token] => [boostedB, base]) : []),

            // Все базовые пары
            ...basePairs,
        ];

        // Фильтруем дубликаты и невалидные пары
        return pairs
            .filter(([t0, t1]) => !t0.equals(t1))
            .filter(([t0, t1], i, otherPairs) => {
                const firstIndexInOtherPairs = otherPairs.findIndex(
                    ([t0Other, t1Other]) => (t0.equals(t0Other) && t1.equals(t1Other)) || (t0.equals(t1Other) && t1.equals(t0Other))
                );
                return firstIndexInOtherPairs === i;
            });
    }, [tokenA, tokenB, boostedA, boostedB, bases, basePairs]);
}
