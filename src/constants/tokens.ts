import { Token } from "@cryptoalgebra/sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    USDT: new Token(DEFAULT_CHAIN_ID, '0x29219dd400f2bf60e5a23d13be72b486d4038894', 6, 'USDC', 'USDC')
}
