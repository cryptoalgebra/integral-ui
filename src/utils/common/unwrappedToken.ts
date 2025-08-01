import { Currency, ExtendedNative, Token, WNATIVE } from "@cryptoalgebra/custom-pools-sdk";
import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { NATIVE_NAME, NATIVE_SYMBOL } from "config";
import { Address, isAddressEqual } from "viem";

export function unwrappedToken(token: Token | Currency | ExtendedNative): Currency | ExtendedNative {
    const chainId = token.chainId;
    const wrappedNative = WNATIVE[chainId];

    const isWrappedNative =
        "isToken" in token && token.isToken && isAddressEqual(token.address as Address, wrappedNative.address as Address);

    const isNative = "isToken" in token && token.isToken && isAddressEqual(token.address as Address, ADDRESS_ZERO);

    if (isWrappedNative || isNative) {
        return ExtendedNative.onChain(chainId, NATIVE_SYMBOL[chainId], NATIVE_NAME[chainId]);
    }

    return token;
}
