import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.Rayls]: {
        USDC: new Token(ChainId.Rayls, "0x91C2c136c5a5b884efeC10eaA8919525f5de25EC", 6, "USDTR", "USDTR"),
        TOKEN: new Token(ChainId.Rayls, "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", 18, "TOKEN", "TOKEN"),
    },
    [ChainId.RaylsDevnet]: {
        USDC: new Token(ChainId.RaylsDevnet, "0x9F068C81ab7743EA7B2D48C0FecEAdaFcAD2c95C", 18, "USDA", "USDA"),
        USDR: new Token(ChainId.RaylsDevnet, "0x0000000000000000000000000000000000000400", 18, "USDR", "USDR"),
    },
};
