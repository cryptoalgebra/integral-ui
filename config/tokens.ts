import { ChainId, Token } from "@cryptoalgebra/integral-sdk";

export const TOKENS = {
    [ChainId.ZenithTestnet]: {
        USDC: new Token(ChainId.ZenithTestnet, "0xA9C02F398B3da32FEbb634Ec4d1ca01d2B1D400a", 6, "USDC", "USDC"),
    },
};

// Boosted tokens whose pools exist on the DEX — used when constructing swap routes through boosted pools
export const BOOSTED_TOKENS = {
    [ChainId.ZenithTestnet]: {},
};
