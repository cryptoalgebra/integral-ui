import { useMemo } from "react";
import { Token } from "@cryptoalgebra/custom-pools-sdk";
import { ExtendedNative } from "@cryptoalgebra/custom-pools-sdk";
import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { useReadContracts } from "wagmi";
import { Address, erc20Abi, isAddressEqual } from "viem";
import { NATIVE_NAME, NATIVE_SYMBOL } from "config/default-chain";
import { STABLECOINS } from "config/tokens";

function findStablecoin(address: Address, chainId: number): Token | undefined {
    const stablecoins = STABLECOINS[chainId as keyof typeof STABLECOINS];
    if (!stablecoins) return undefined;

    for (const token of Object.values(stablecoins)) {
        if (isAddressEqual(token.address as Address, address)) {
            return token;
        }
    }
    return undefined;
}

export function useAlgebraToken(address: Address | undefined, chainId: number) {
    // Check if token exists in STABLECOINS config
    const stablecoinToken = useMemo(() => {
        if (!address) return undefined;
        return findStablecoin(address, chainId);
    }, [address, chainId]);

    const { data: tokenData, isLoading } = useReadContracts({
        allowFailure: false,
        contracts: [
            {
                address: address as Address,
                abi: erc20Abi,
                functionName: "symbol",
            },
            {
                address: address as Address,
                abi: erc20Abi,
                functionName: "name",
            },
            {
                address: address as Address,
                abi: erc20Abi,
                functionName: "decimals",
            },
        ],
        query: {
            enabled: !stablecoinToken && !!address && address !== ADDRESS_ZERO,
        },
    });

    return useMemo(() => {
        if (!address) return;

        const isETH = address === ADDRESS_ZERO;

        if (isETH) return ExtendedNative.onChain(chainId, NATIVE_SYMBOL[chainId], NATIVE_NAME[chainId]);

        if (stablecoinToken) return stablecoinToken;

        if (isLoading || !tokenData) return undefined;

        const [symbol, name, decimals] = tokenData;

        return new Token(chainId, address, decimals, symbol, name);
    }, [address, tokenData, isLoading, chainId, stablecoinToken]);
}
