import { ChainId, Token } from "@cryptoalgebra/integral-sdk";

export const TOKENS = {
    [ChainId.ADI]: {
        USDC: new Token(ChainId.ADI, "0x9cb8142aEBBcdc60AF7c97Af897A67A8f3CA71C2", 6, "USDC.e", "USD Coin"),
    },
};

// const UNDERLYING_TOKENS = {
//     [ChainId.Ethereum]: {
//         UNDERLYING_USDC: new Token(ChainId.Ethereum, "0xdc8eB684CA4bCD58CAFEacdBBF5A9fA628F81DF3", 18, "USDC", "USD Coin"),
//         UNDERLYING_WETH: new Token(ChainId.Ethereum, "0x6113D55fCb7949B6d118563DAC32cB5D76009c18", 18, "WETH", "Wrapped Ether"),
//     },
// };

// Boosted tokens whose pools exist on the DEX — used when constructing swap routes through boosted pools
export const BOOSTED_TOKENS = {
    [ChainId.ADI]: {
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
