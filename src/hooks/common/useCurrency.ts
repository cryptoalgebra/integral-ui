import { Address } from 'wagmi';
import {
    Currency,
    ExtendedNative,
} from '@cryptoalgebra/integral-sdk';
import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
import { DEFAULT_CHAIN_ID, DEFAULT_NATIVE_NAME, DEFAULT_NATIVE_SYMBOL } from "@/constants/default-chain-id";
import { useAlgebraToken } from "./useAlgebraToken";
import { WNATIVE_ADDRESS } from '@/constants/addresses';

export function useCurrency(
    address: Address | undefined,
    withNative?: boolean
): Currency | ExtendedNative | undefined {

    const isWNative = address?.toLowerCase() === WNATIVE_ADDRESS.toLowerCase()

    const isNative = address === ADDRESS_ZERO;

    const token = useAlgebraToken(isNative || isWNative ? ADDRESS_ZERO : address)

    const extendedEther = ExtendedNative.onChain(DEFAULT_CHAIN_ID, DEFAULT_NATIVE_SYMBOL, DEFAULT_NATIVE_NAME);

    if (withNative) return isNative || isWNative ? extendedEther : token;

    if (isWNative) return extendedEther.wrapped

    return isNative ? extendedEther : token;
}