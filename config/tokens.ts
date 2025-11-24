import { ChainId, Token, WNATIVE, BoostedToken } from "@cryptoalgebra/custom-pools-sdk";

export const TOKENS = {
    [ChainId.Base]: {
        USDC: new Token(ChainId.Base, "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", 6, "USDC", "USDC"),
        USDT: new Token(ChainId.Base, "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", 6, "USDT", "USDT"),
        agEUR: new Token(ChainId.Base, "0xA61BeB4A3d02decb01039e378237032B351125B4", 18, "agEUR", "agEUR"),
        eUSD: new Token(ChainId.Base, "0xCfA3Ef56d303AE4fAabA0592388F19d7C3399FB4", 18, "eUSD", "Electronic Dollar"),
    },
    [ChainId.BaseSepolia]: {
        USDC: new Token(ChainId.BaseSepolia, "0xAbAc6f23fdf1313FC2E9C9244f666157CcD32990", 6, "USDC", "USDC"),
        USDT: new Token(ChainId.BaseSepolia, "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", 6, "USDC", "USDC"),
    },
};

export const BOOSTED_TOKENS = {
    [ChainId.Base]: {
        sparkUSDC: new BoostedToken(
            ChainId.Base,
            "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A",
            18,
            "sparkUSDC",
            "Spark USDC Vault",
            TOKENS[ChainId.Base].USDC
        ),
        mwETH: new BoostedToken(
            ChainId.Base,
            "0xa0E430870c4604CcfC7B38Ca7845B1FF653D0ff1",
            18,
            "mwETH",
            "Moonwell Flagship ETH",
            WNATIVE[ChainId.Base]
        ),
        steakEURA: new BoostedToken(
            ChainId.Base,
            "0xBEeFA28D5e56d41D35df760AB53B94D9FfD7051F",
            18,
            "steakEURA",
            "Steakhouse EURA",
            TOKENS[ChainId.Base].agEUR
        ),
        ["Re7 eUSD"]: new BoostedToken(
            ChainId.Base,
            "0xc9C474C6Aa0E930ED42fD1f40be5b1d6A5eAD645",
            18,
            "Re7 eUSD",
            "Re7 eUSD",
            TOKENS[ChainId.Base].eUSD
        ),
    },
};
