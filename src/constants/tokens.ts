import { Token } from "@cryptoalgebra/custom-pools-sdk";
import { DEFAULT_CHAIN_ID } from "./default-chain-id";

export const STABLECOINS = {
    USDC: new Token(DEFAULT_CHAIN_ID, "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", 6, "USDC", "USDC"),
};
