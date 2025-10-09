import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.BaseSepolia]: {
        USDC: new Token(ChainId.BaseSepolia, "0xAbAc6f23fdf1313FC2E9C9244f666157CcD32990", 6, "USDC", "USDC"),
        TOKEN: new Token(ChainId.BaseSepolia, "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", 18, "TOKEN", "TOKEN"),
    },
};
