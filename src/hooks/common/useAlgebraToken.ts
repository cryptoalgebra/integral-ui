import { useMemo } from "react";
import { ExtendedNative, Token, BoostedToken } from "@cryptoalgebra/custom-pools-sdk";
import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { useReadContracts } from "wagmi";
import { Address, erc20Abi, erc4626Abi } from "viem";
import { NATIVE_NAME, NATIVE_SYMBOL } from "config/default-chain";

export function useAlgebraToken(address: Address | undefined, chainId: number): Token | ExtendedNative | BoostedToken | undefined {
    const isNative = address === ADDRESS_ZERO;

    const { data: tokenData, isLoading } = useReadContracts({
        allowFailure: true,
        contracts: address
            ? [
                  { address, abi: erc20Abi, functionName: "symbol" },
                  { address, abi: erc20Abi, functionName: "name" },
                  { address, abi: erc20Abi, functionName: "decimals" },
                  { address, abi: erc4626Abi, functionName: "asset" },
              ]
            : [],
        query: {
            enabled: !!address && !isNative,
        },
    });

    const [symbol, name, decimals, underlyingAddress] = tokenData?.map((d) => d?.result) ?? [];

    const { data: underlyingData } = useReadContracts({
        allowFailure: true,
        contracts:
            underlyingAddress && typeof underlyingAddress === "string"
                ? [
                      { address: underlyingAddress as Address, abi: erc20Abi, functionName: "symbol" },
                      { address: underlyingAddress as Address, abi: erc20Abi, functionName: "name" },
                      { address: underlyingAddress as Address, abi: erc20Abi, functionName: "decimals" },
                  ]
                : [],
        query: {
            enabled: !!underlyingAddress,
        },
    });

    return useMemo(() => {
        const native = ExtendedNative.onChain(chainId, NATIVE_SYMBOL[chainId], NATIVE_NAME[chainId]);
        if (isNative) {
            return native;
        }

        if (isLoading || !symbol || !name || !decimals || !address) return undefined;

        const baseToken = new Token(chainId, address, Number(decimals), String(symbol), String(name));

        if (underlyingData && underlyingAddress) {
            const [uSymbol, uName, uDecimals] = underlyingData.map((d) => d?.result);
            if (uSymbol && uName && uDecimals) {
                const underlying = new Token(chainId, underlyingAddress as Address, Number(uDecimals), String(uSymbol), String(uName));
                return new BoostedToken(chainId, address, Number(decimals), String(symbol), String(name), underlying);
            }
        }

        return baseToken;
    }, [address, chainId, isNative, isLoading, symbol, name, decimals, underlyingAddress, underlyingData]);
}
