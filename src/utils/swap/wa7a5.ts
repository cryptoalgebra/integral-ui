import { Currency } from "@cryptoalgebra/integral-sdk";
import { TOKENS } from "config";

export const Wa7A5WrapDirection = {
    A7A5_TO_WA7A5: "A7A5_TO_WA7A5",
    WA7A5_TO_A7A5: "WA7A5_TO_A7A5",
} as const;

export type Wa7A5WrapDirectionType = typeof Wa7A5WrapDirection[keyof typeof Wa7A5WrapDirection];

export function getWa7A5PairTokens(chainId: number | undefined) {
    const chainTokens = chainId ? TOKENS[chainId as keyof typeof TOKENS] : undefined;

    return {
        a7A5Token: chainTokens?.A7A5,
        wa7A5Token: chainTokens?.WA7A5,
    };
}

export function getWa7A5WrapDirection(
    inputCurrency: Currency | undefined,
    outputCurrency: Currency | undefined,
): Wa7A5WrapDirectionType | null {
    if (!inputCurrency || !outputCurrency || !inputCurrency.isToken || !outputCurrency.isToken) return null;

    const chainId = inputCurrency.chainId ?? outputCurrency.chainId;
    const { a7A5Token, wa7A5Token } = getWa7A5PairTokens(chainId);

    if (!a7A5Token || !wa7A5Token) return null;

    const inputAddress = inputCurrency.address.toLowerCase();
    const outputAddress = outputCurrency.address.toLowerCase();

    if (inputAddress === a7A5Token.address.toLowerCase() && outputAddress === wa7A5Token.address.toLowerCase()) {
        return Wa7A5WrapDirection.A7A5_TO_WA7A5;
    }

    if (inputAddress === wa7A5Token.address.toLowerCase() && outputAddress === a7A5Token.address.toLowerCase()) {
        return Wa7A5WrapDirection.WA7A5_TO_A7A5;
    }

    return null;
}
