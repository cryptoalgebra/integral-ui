import { Token } from "@cryptoalgebra/circuit-sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    USDT: new Token(DEFAULT_CHAIN_ID, '0xf55bec9cafdbe8730f096aa55dad6d22d44099df', 6, 'USDT', 'USDT')
}
