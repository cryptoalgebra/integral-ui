import { useChainId } from "wagmi";
import { BoostedToken, Currency, ExtendedNative, Token, WNATIVE } from "@cryptoalgebra/integral-sdk";
import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
import { BOOSTED_TOKENS, NATIVE_NAME, NATIVE_SYMBOL } from "config";
import { useAlgebraToken } from "./useAlgebraToken";
import { Address } from "viem";

export function useCurrency(address: Address | undefined, asNative: boolean = true): Currency | ExtendedNative | undefined {
    const chainId = useChainId();
    const isWNative = address?.toLowerCase() === WNATIVE[chainId].address.toLowerCase();

    const isNative = address === ADDRESS_ZERO;

    const token = useAlgebraToken(isNative ? ADDRESS_ZERO : address, chainId);

    const extendedEther = ExtendedNative.onChain(chainId, NATIVE_SYMBOL[chainId], NATIVE_NAME[chainId]);

    if (asNative) return isNative || isWNative ? extendedEther : token;

    if (isWNative) return extendedEther.wrapped;

    return isNative ? extendedEther : token;
}

export function getCurrency(chainId: number, address: string, decimals: number, symbol?: string, name?: string): Currency {
    const isNative = address === ADDRESS_ZERO;

    if (isNative) {
        return ExtendedNative.onChain(chainId, NATIVE_SYMBOL[chainId], NATIVE_NAME[chainId]);
    }

    const knownBoostedToken = Object.values(BOOSTED_TOKENS[chainId]).find((bt) => bt.address.toLowerCase() === address.toLowerCase()) as
        | BoostedToken
        | undefined;

    if (knownBoostedToken) {
        return knownBoostedToken;
    }

    return new Token(chainId, address, decimals, symbol, name);
}
