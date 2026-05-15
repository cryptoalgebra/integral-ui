import { useChainId } from "wagmi";
import { Currency, ExtendedNative } from "@cryptoalgebra/custom-pools-sdk";
// import { NATIVE_NAME, NATIVE_SYMBOL } from "config";
import { useAlgebraToken } from "./useAlgebraToken";
import { Address } from "viem";

export function useCurrency(address: Address | undefined): Currency | ExtendedNative | undefined {
    const chainId = useChainId();

    return useAlgebraToken(address, chainId);

    // const isWNative = address?.toLowerCase() === WNATIVE[chainId].address.toLowerCase();

    // const isNative = address === ADDRESS_ZERO;

    // const token = useAlgebraToken(isNative || isWNative ? NATIVE_USDR : address, chainId);

    // const extendedEther = ExtendedNative.onChain(chainId, NATIVE_SYMBOL[chainId], NATIVE_NAME[chainId]);

    // if (asNative) return isNative || isWNative ? extendedEther : token;

    // if (isWNative) return extendedEther.wrapped;

    // return isNative ? extendedEther : token;
}
