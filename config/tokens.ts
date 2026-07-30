import { ChainId, Token } from "@cryptoalgebra/integral-sdk";

export const TOKENS = {
    [ChainId.AlpenTestnet]: {
        USDC: new Token(ChainId.AlpenTestnet, "0xd7cB0E0692f2D55A17bA81c1fE5501D66774fC4A", 6, "USDC", "USDC"),
    },
};

// Boosted tokens whose pools exist on the DEX — used when constructing swap routes through boosted pools
export const BOOSTED_TOKENS = {
    [ChainId.AlpenTestnet]: {},
};
