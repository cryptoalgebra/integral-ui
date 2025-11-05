import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.Rayls]: {
        USDC: new Token(ChainId.Rayls, "0x91C2c136c5a5b884efeC10eaA8919525f5de25EC", 6, "USDTR", "USDTR"),
        TOKEN: new Token(ChainId.Rayls, "0xDeB24A7dD1491966598B3BDd28F51F2Ca939CB1f", 18, "TOKEN", "TOKEN"),
    },
};
