import { ChainId, Token, BoostedToken } from "@cryptoalgebra/integral-sdk";

export const TOKENS = {
    [ChainId.BaseSepolia]: {
        USDC: new Token(ChainId.BaseSepolia, "0xAbAc6f23fdf1313FC2E9C9244f666157CcD32990", 6, "USDC", "USDC"),
        USDT: new Token(ChainId.BaseSepolia, "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", 6, "USDC", "USDC"),
        TOKEN: new Token(ChainId.BaseSepolia, "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", 18, "TOKEN", "TOKEN"),
        UNDERLYING_USDC: new Token(ChainId.BaseSepolia, "0xdc8eB684CA4bCD58CAFEacdBBF5A9fA628F81DF3", 18, "USDC", "USDC"),
        UNDERLYING_WETH: new Token(ChainId.BaseSepolia, "0x6113D55fCb7949B6d118563DAC32cB5D76009c18", 18, "WETH", "WETH"),
    },
};

// Boosted tokens whose pools exist on the DEX — used when constructing swap routes through boosted pools
export const BOOSTED_TOKENS = {
    [ChainId.BaseSepolia]: {
        avUSDC: new BoostedToken(
            ChainId.BaseSepolia,
            "0x6045450424c527bee1a2638d822d11bbca4f2a46",
            18,
            "avUSDC",
            "Algebra Vault USDC",
            TOKENS[ChainId.BaseSepolia].UNDERLYING_USDC,
        ),
        avETH: new BoostedToken(
            ChainId.BaseSepolia,
            "0xF115d73823B3268AaaA58691a3778c08DeE77A91",
            18,
            "avETH",
            "Algebra Vault ETH",
            TOKENS[ChainId.BaseSepolia].UNDERLYING_WETH,
        ),
    },
};
