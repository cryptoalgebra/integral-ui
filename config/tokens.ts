import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.PharosTestnet]: {
        USDC: new Token(ChainId.PharosTestnet, "0x95e325a85b9e6cb4dea2ccd96218e5f8365e0b0f", 18, "USDC", "USDC"),
    },
};
