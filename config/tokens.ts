import { ChainId, Token } from "@cryptoalgebra/integral-sdk";

export const TOKENS = {
    [ChainId.GiwaSepolia]: {
        USDA: new Token(ChainId.GiwaSepolia, "0x6287824D5A6D88C363291D5353cb123693ce65A4", 18, "USDA", "USDA"),
        TEST: new Token(ChainId.GiwaSepolia, "0xBCdB22f56642DE57624CfC2fBb9eE398cF3CA268", 18, "TEST", "TEST"),
    },
};

export const UNDERLYING_TOKENS = {
    [ChainId.GiwaSepolia]: {},
};

// Boosted tokens whose pools exist on the DEX — used when constructing swap routes through boosted pools
export const BOOSTED_TOKENS = {
    [ChainId.GiwaSepolia]: {},
};
