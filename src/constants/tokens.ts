import { Token } from "@cryptoalgebra/sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    TON: new Token(DEFAULT_CHAIN_ID, "0xbE3C16e14d578a24eF4B124fAf9CD1bb5F1e964B", 9, "TON", "TON"),
    X: new Token(DEFAULT_CHAIN_ID, "0xc208e122Ff9915747eee968926be395eB5D9155C", 9, "X", "X Empire"),
    USDT: new Token(DEFAULT_CHAIN_ID, "0xF094abDead5c41E23f9E41B2771a854CFF127Ae7", 9, "USDT", "USDT"), // actually it's durev
};
