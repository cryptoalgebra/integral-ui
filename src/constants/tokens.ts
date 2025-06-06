import { Token } from "@cryptoalgebra/custom-pools-sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    USDC: new Token(DEFAULT_CHAIN_ID, '0x0b7007c13325c48911f73a2dad5fa5dcbf808adc', 6, 'USDC', 'USDC')
}