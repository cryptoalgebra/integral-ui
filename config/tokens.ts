import { ChainId, Token, BoostedToken, WNATIVE } from "@cryptoalgebra/integral-sdk";

export const TOKENS = {
    [ChainId.BaseSepolia]: {
        USDC: new Token(ChainId.BaseSepolia, "0xAbAc6f23fdf1313FC2E9C9244f666157CcD32990", 6, "USDC", "USDC"),
        USDT: new Token(ChainId.BaseSepolia, "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", 6, "USDC", "USDC"),
        TOKEN: new Token(ChainId.BaseSepolia, "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", 18, "TOKEN", "TOKEN"),
    },
};

// Boosted tokens whose pools exist on the DEX — used when constructing swap routes through boosted pools
export const BOOSTED_TOKENS = {
    [ChainId.BaseSepolia]: {
        sparkUSDC: new BoostedToken(
            ChainId.BaseSepolia,
            "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A",
            18,
            "sparkUSDC",
            "Spark USDC Vault",
            TOKENS[ChainId.BaseSepolia].USDC
        ),
        mwETH: new BoostedToken(
            ChainId.BaseSepolia,
            "0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1",
            18,
            "mwETH",
            "Moonwell Flagship ETH",
            WNATIVE[ChainId.BaseSepolia]
        ),
    },
};
