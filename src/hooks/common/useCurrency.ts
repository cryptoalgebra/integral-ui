import { Address } from 'wagmi';
import {
    Currency,
    ExtendedEther,
    WNATIVE
} from '@cryptoalgebra/integral-sdk';
import { ADDRESS_ZERO } from "@cryptoalgebra/integral-sdk";
import { DEFAULT_CHAIN_ID } from "@/constants/default-chain-id";
import { useAlgebraToken } from "./useAlgebraToken";

export function useCurrency(
    address: Address | undefined
): Currency | undefined {

    const isWeth = address?.toLowerCase() === WNATIVE[DEFAULT_CHAIN_ID].address.toLowerCase()

    const isETH = address === ADDRESS_ZERO;

    const token = useAlgebraToken(isWeth ? ADDRESS_ZERO : address)

    const extendedEther = ExtendedEther.onChain(DEFAULT_CHAIN_ID);
    const weth = WNATIVE[DEFAULT_CHAIN_ID];

    // if (weth?.address?.toLowerCase() === address?.toLowerCase()) return weth;

    return isETH ? extendedEther : token;
}