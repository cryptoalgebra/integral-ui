import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.BSC]: {
        USDC: new Token(ChainId.BSC, "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", 6, "USDC", "USDC"),
        USDT: new Token(ChainId.BSC, "0x55d398326f99059fF775485246999027B3197955", 6, "USDT", "USDT"),
        TOKEN: new Token(ChainId.BSC, "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", 18, "TOKEN", "TOKEN"),
    },
};
