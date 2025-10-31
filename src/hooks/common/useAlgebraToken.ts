import { useMemo } from "react";
import { ExtendedNative } from "@cryptoalgebra/custom-pools-sdk";
import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { useReadContracts } from "wagmi";
import { Address, erc20Abi } from "viem";
import { NATIVE_NAME, NATIVE_SYMBOL } from "config/default-chain";
import { tryCreateBoostedToken } from "@/utils/token/tryCreateBoostedToken";

export function useAlgebraToken(address: Address | undefined, chainId: number) {
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
    });

    return useMemo(() => {
        if (!address) return;

        const isETH = address === ADDRESS_ZERO;

        if (isETH) return ExtendedNative.onChain(chainId, NATIVE_SYMBOL[chainId], NATIVE_NAME[chainId]);

        if (isLoading || !tokenData) return undefined;

        const [symbol, name, decimals] = tokenData;

        return tryCreateBoostedToken(chainId, address, decimals, symbol, name);

        // return new Token(chainId, address, decimals, symbol, name);
    }, [address, tokenData, isLoading, chainId]);
}
