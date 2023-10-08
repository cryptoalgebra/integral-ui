import { Token } from "@cryptoalgebra/integral-sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    USDC: new Token(DEFAULT_CHAIN_ID, '0x5aefba317baba46eaf98fd6f381d07673bca6467', 6, 'USDC', 'USDC')
} 