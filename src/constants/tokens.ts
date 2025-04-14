import { Token } from "@cryptoalgebra/sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    USDC: new Token(DEFAULT_CHAIN_ID, "0x83d4a9ea77a4dba073cd90b30410ac9f95f93e7c", 9, "USDC", "USDC"),
};

export const TOKENS = {
    TON: new Token(DEFAULT_CHAIN_ID, "0xbe3c16e14d578a24ef4b124faf9cd1bb5f1e964b", 9, "TON", "TON"),
    X: new Token(DEFAULT_CHAIN_ID, "0xc208e122Ff9915747eee968926be395eB5D9155C", 9, "X", "X Empire"),
    durev: new Token(DEFAULT_CHAIN_ID, "0xF094abDead5c41E23f9E41B2771a854CFF127Ae7", 9, "durev", "durev"),
};
