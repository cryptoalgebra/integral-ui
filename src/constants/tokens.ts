import { Token } from "@cryptoalgebra/custom-pools-sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    USDC: new Token(DEFAULT_CHAIN_ID, '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea', 6, 'USDC', 'USDC')
}