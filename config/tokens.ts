import { ChainId, Token } from "@cryptoalgebra/integral-sdk";

export const TOKENS = {
    [ChainId.Robinhood]: {
        USDG: new Token(ChainId.Robinhood, "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168", 6, "USDG", "Global Dollar"),
    },
};

// Boosted tokens whose pools exist on the DEX — used when constructing swap routes through boosted pools
export const BOOSTED_TOKENS = {
    [ChainId.Robinhood]: {},
};
