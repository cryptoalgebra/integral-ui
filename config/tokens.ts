import { ChainId, Token } from "@cryptoalgebra/integral-sdk";

export const TOKENS = {
    [ChainId.Ethereum]: {
        USDC: new Token(ChainId.Ethereum, "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 6, "USDC", "USD Coin"),
        A7A5: new Token(ChainId.Ethereum, "0x6fa0be17e4bea2fcfa22ef89bf8ac9aab0ab0fc9", 6, "A7A5", "A7A5"),
        WA7A5: new Token(ChainId.Ethereum, "0xf442ff10b8def89514560a66c0ad28777094636a", 6, "wA7A5", "Wrapped A7A5 1.0"),
        USDT: new Token(ChainId.Ethereum, "0xdAC17F958D2ee523a2206206994597C13D831ec7", 6, "USDT", "Tether USD"),
        TOKEN: new Token(ChainId.Ethereum, "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", 18, "TOKEN", "TOKEN"),
    },
};

export const FEE_ON_TRANSFER_TOKENS = {
    [ChainId.Ethereum]: [TOKENS[ChainId.Ethereum].A7A5, TOKENS[ChainId.Ethereum].WA7A5],
};

// const UNDERLYING_TOKENS = {
//     [ChainId.Ethereum]: {
//         UNDERLYING_USDC: new Token(ChainId.Ethereum, "0xdc8eB684CA4bCD58CAFEacdBBF5A9fA628F81DF3", 18, "USDC", "USD Coin"),
//         UNDERLYING_WETH: new Token(ChainId.Ethereum, "0x6113D55fCb7949B6d118563DAC32cB5D76009c18", 18, "WETH", "Wrapped Ether"),
//     },
// };

// Boosted tokens whose pools exist on the DEX — used when constructing swap routes through boosted pools
export const BOOSTED_TOKENS = {
    [ChainId.Ethereum]: {
        // avUSDC: new BoostedToken(
        //     ChainId.Ethereum,
        //     "0x6045450424C527bEe1A2638D822D11BbCA4F2a46",
        //     18,
        //     "avUSDC",
        //     "Algebra Vault USDC",
        //     UNDERLYING_TOKENS[ChainId.Ethereum].UNDERLYING_USDC,
        // ),
        // avETH: new BoostedToken(
        //     ChainId.Ethereum,
        //     "0xF115d73823B3268AaaA58691a3778c08DeE77A91",
        //     18,
        //     "avETH",
        //     "Algebra Vault ETH",
        //     UNDERLYING_TOKENS[ChainId.Ethereum].UNDERLYING_WETH,
        // ),
    },
};
