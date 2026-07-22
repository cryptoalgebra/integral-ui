import { ChainId, Token } from "@cryptoalgebra/integral-sdk";

export const TOKENS = {
    [ChainId.Hemi]: {
        USDC: new Token(ChainId.Hemi, "0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA", 6, "USDC.e", "USD Coin"),
    },
};

// Boosted tokens whose pools exist on the DEX — used when constructing swap routes through boosted pools
export const BOOSTED_TOKENS = {
    [ChainId.Hemi]: {
        // avUSDC: new BoostedToken(
        //     ChainId.Hemi,
        //     "0x6045450424c527bee1a2638d822d11bbca4f2a46",
        //     18,
        //     "avUSDC",
        //     "Algebra Vault USDC",
        //     TOKENS[ChainId.Hemi].UNDERLYING_USDC,
        // ),
        // avETH: new BoostedToken(
        //     ChainId.Hemi,
        //     "0xF115d73823B3268AaaA58691a3778c08DeE77A91",
        //     18,
        //     "avETH",
        //     "Algebra Vault ETH",
        //     TOKENS[ChainId.Hemi].UNDERLYING_WETH,
        // ),
    },
};
