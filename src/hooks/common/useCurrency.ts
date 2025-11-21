import { useChainId } from "wagmi";
import { Currency, ExtendedNative, WNATIVE } from "@cryptoalgebra/custom-pools-sdk";
import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { NATIVE_NAME, NATIVE_SYMBOL } from "config";
import { useAlgebraToken } from "./useAlgebraToken";
import { Address } from "viem";

export function useCurrency(address: Address | undefined, asNative: boolean = true): Currency | ExtendedNative | undefined {
    const chainId = useChainId();
    const isWNative = address?.toLowerCase() === WNATIVE[chainId].address.toLowerCase();

    const isNative = address === ADDRESS_ZERO;

    const token = useAlgebraToken(isNative ? ADDRESS_ZERO : address, chainId);

    const extendedEther = ExtendedNative.onChain(chainId, NATIVE_SYMBOL[chainId], NATIVE_NAME[chainId]);

    // If ADDRESS_ZERO is passed, return native token
    if (isNative) return extendedEther;

    // If WETH address is passed and asNative is true, return native
    // If WETH address is passed and asNative is false, return wrapped token
    if (isWNative) {
        return asNative ? extendedEther : extendedEther.wrapped;
    }

    return token;
}
