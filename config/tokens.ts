import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.PharosTestnet]: {
        USDC: new Token(ChainId.PharosTestnet, "0xE0BE08c77f415F577A1B3A9aD7a1Df1479564ec8", 6, "USDC", "USDC"),
    },
};
