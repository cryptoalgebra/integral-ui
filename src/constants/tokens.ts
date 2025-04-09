import { Token } from "@cryptoalgebra/sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    USDT: new Token(DEFAULT_CHAIN_ID, '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1', 6, 'USDC', 'USDC')
}
