import { Token } from "@cryptoalgebra/sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    USDT: new Token(DEFAULT_CHAIN_ID, '0x7d98346b3b000c55904918e3d9e2fc3f94683b01', 6, 'USDT', 'USDT')
}
