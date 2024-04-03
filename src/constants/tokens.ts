import { Token } from "@cryptoalgebra/integral-sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    USDT: new Token(DEFAULT_CHAIN_ID, '0x6581e59a1c8da66ed0d313a0d4029dce2f746cc5', 18, 'stgUSDC', 'stargate USD Coin')
}