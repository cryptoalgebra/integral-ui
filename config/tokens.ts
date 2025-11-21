import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.MantraDukong]: {
        USDC: new Token(ChainId.MantraDukong, "0x49b163c575948F0b95e0c459C301995147f27866", 6, "USDC", "USDC"),
        USDT: new Token(ChainId.MantraDukong, "0x21E56013a76a7F1F86cF7ee95c0a5670C7b7e44D", 6, "USDT", "USDT"),
        TOKEN: new Token(ChainId.MantraDukong, "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", 18, "TOKEN", "TOKEN"),
    },
};
