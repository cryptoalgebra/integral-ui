import { ChainId, Token } from "@cryptoalgebra/integral-sdk";

export const TOKENS = {
    [ChainId.GiwaSepolia]: {
        USDA: new Token(ChainId.GiwaSepolia, "0x6287824D5A6D88C363291D5353cb123693ce65A4", 18, "USDA", "USDA"),
        TEST: new Token(ChainId.GiwaSepolia, "0xBCdB22f56642DE57624CfC2fBb9eE398cF3CA268", 18, "TEST", "TEST"),
    },
};

export const UNDERLYING_TOKENS = {
    // [ChainId.GiwaSepolia]: {
    //     UNDERLYING_USDC: new Token(ChainId.GiwaSepolia, "0xdc8eB684CA4bCD58CAFEacdBBF5A9fA628F81DF3", 18, "USDC", "USDC"),
    //     UNDERLYING_WETH: new Token(ChainId.GiwaSepolia, "0x6113D55fCb7949B6d118563DAC32cB5D76009c18", 18, "WETH", "WETH"),
    // }
};

// Boosted tokens whose pools exist on the DEX — used when constructing swap routes through boosted pools
export const BOOSTED_TOKENS = {
    // [ChainId.GiwaSepolia]: {
    //     avUSDC: new BoostedToken(
    //         ChainId.GiwaSepolia,
    //         "0x6045450424C527bEe1A2638D822D11BbCA4F2a46",
    //         18,
    //         "avUSDC",
    //         "Algebra Vault USDC",
    //         UNDERLYING_TOKENS[ChainId.GiwaSepolia].UNDERLYING_USDC
    //     ),
    //     avETH: new BoostedToken(
    //         ChainId.GiwaSepolia,
    //         "0xF115d73823B3268AaaA58691a3778c08DeE77A91",
    //         18,
    //         "avETH",
    //         "Algebra Vault ETH",
    //         UNDERLYING_TOKENS[ChainId.GiwaSepolia].UNDERLYING_WETH
    //     ),
    // },
};
