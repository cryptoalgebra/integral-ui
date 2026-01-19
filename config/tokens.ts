import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.CitreaMainnet]: {
        USDC: new Token(ChainId.CitreaMainnet, "0xE045e6c36cF77FAA2CfB54466D71A3aEF7bbE839", 0, "USDC", "USDC"),
        USDT: new Token(ChainId.CitreaMainnet, "0x9f3096Bac87e7F03DC09b0B416eB0DF837304dc4", 0, "USDT", "USDT"),
        TOKEN: new Token(ChainId.CitreaMainnet, "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", 18, "TOKEN", "TOKEN"),
    },
};
