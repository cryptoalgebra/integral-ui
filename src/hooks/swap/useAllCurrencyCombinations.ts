import { BASES_TO_CHECK_TRADES_AGAINST } from "@/constants/routing"
import { Currency, Token } from "@cryptoalgebra/sdk"
import { useMemo } from "react"
import { useChainId } from "wagmi"

export function useAllCurrencyCombinations(currencyA?: Currency, currencyB?: Currency): [Token, Token][] {

    const chainId = useChainId()

    const [tokenA, tokenB] = chainId ? [currencyA?.wrapped, currencyB?.wrapped] : [undefined, undefined]

    const bases: Token[] = useMemo(() => {
        if (!chainId) return []

        return BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? []

    }, [chainId])

    const basePairs: [Token, Token][] = useMemo(
        () =>
            bases
                .flatMap((base): [Token, Token][] => bases.map((otherBase) => [base, otherBase]))
                .filter(([t0, t1]) => !t0.equals(t1)),
        [bases]
    )

    return useMemo(
        () =>
            tokenA && tokenB
                ? [
                    [tokenA, tokenB] as [Token, Token],
                    ...bases.map((base): [Token, Token] => [tokenA, base]),
                    ...bases.map((base): [Token, Token] => [tokenB, base]),
                    ...basePairs
                ]
                    .filter(([t0, t1]) => !t0.equals(t1))
                    .filter(([t0, t1], i, otherPairs) => {
                        const firstIndexInOtherPairs = otherPairs.findIndex(([t0Other, t1Other]) => {
                            return (t0.equals(t0Other) && t1.equals(t1Other)) || (t0.equals(t1Other) && t1.equals(t0Other))
                        })
                        return firstIndexInOtherPairs === i
                    })
                : [],
        [tokenA, tokenB, bases, basePairs, chainId]
    )
}
