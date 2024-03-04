import { Address } from 'wagmi';
import {
    Currency,
    ExtendedNative,
    WNATIVE
} from '@cryptoalgebra/integral-sdk';
import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
import { DEFAULT_CHAIN_ID, DEFAULT_NATIVE_NAME, DEFAULT_NATIVE_SYMBOL } from "@/constants/default-chain-id";
import { useAlgebraToken } from "./useAlgebraToken";

export function useCurrency(
    address: Address | undefined
): Currency | ExtendedNative | undefined {

    const isWETH = address?.toLowerCase() === WNATIVE[DEFAULT_CHAIN_ID].address.toLowerCase()

    const isETH = address === ADDRESS_ZERO;

    const token = useAlgebraToken(isETH || isWETH ? ADDRESS_ZERO : address)

    const extendedEther = ExtendedNative.onChain(DEFAULT_CHAIN_ID, DEFAULT_NATIVE_SYMBOL, DEFAULT_NATIVE_NAME);

    return isETH || isWETH ? extendedEther : token;
}