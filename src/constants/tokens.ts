import { Token } from "@cryptoalgebra/custom-pools-sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    USDT: new Token(DEFAULT_CHAIN_ID, '0xabac6f23fdf1313fc2e9c9244f666157ccd32990', 6, 'USDT', 'USDT')
}