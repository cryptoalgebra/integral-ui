import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.Henesys]: {
        USDC: new Token(ChainId.Henesys, "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", 6, "USDC", "USDC"),
    },
};
