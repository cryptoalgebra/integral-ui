import { ChainId, Token, WNATIVE, BoostedToken } from "@cryptoalgebra/custom-pools-sdk";

export const TOKENS = {
    [ChainId.Base]: {
        USDC: new Token(ChainId.Base, "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", 6, "USDC", "USDC"),
        USDT: new Token(ChainId.Base, "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", 6, "USDT", "USDT"),
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
    },
};

export const getBoostedToken = (token: Token): BoostedToken | undefined => {
    const chainId = token.chainId;
    const boostedTokens = BOOSTED_TOKENS[chainId] || {};
    return Object.values(boostedTokens as Record<string, BoostedToken>).find((bt) => bt.underlying.equals(token));
};

export const getUnderlyingToken = (token: BoostedToken | Token): Token | undefined => {
    // if (!boostedToken) return undefined;

    if (token instanceof BoostedToken) {
        return token.underlying;
    }
    const chainId = token.chainId;
    const boostedTokens = BOOSTED_TOKENS[chainId] || {};
    return Object.values(boostedTokens as Record<string, BoostedToken>).find((bt) => bt.equals(token))?.underlying;
};
