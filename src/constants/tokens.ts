import { Token } from "@cryptoalgebra/integral-sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";
import { USDT_ADDRESS } from "./addresses";

export const STABLECOINS = {
    USDT: new Token(DEFAULT_CHAIN_ID, USDT_ADDRESS, 6, 'USDT', 'USDT')
}