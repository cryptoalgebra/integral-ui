import { useMemo } from "react";
import { Token } from "@cryptoalgebra/custom-pools-sdk";
import { ExtendedNative } from "@cryptoalgebra/custom-pools-sdk";
import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { DEFAULT_NATIVE_NAME, DEFAULT_NATIVE_SYMBOL } from "config";
import { Address } from "viem";
import { useAllTokens } from "../tokens/useAllTokens";

export function useAlgebraToken(address: Address | undefined, chainId: number) {
    const { tokens, isLoading } = useAllTokens();

    return useMemo(() => {
        if (!tokens || !address) return;
        const isETH = address === ADDRESS_ZERO;

        if (isETH) return ExtendedNative.onChain(chainId, DEFAULT_NATIVE_SYMBOL, DEFAULT_NATIVE_NAME);

        const tokenData = tokens.find((token) => token.id.toLowerCase() === address.toLowerCase());

        if (isLoading || !tokenData) return undefined;

        const { decimals, name, symbol } = tokenData;

        return new Token(chainId, address, Number(decimals), symbol, name);
    }, [address, tokens, isLoading, chainId]);
}
