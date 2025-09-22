import { ChainId, Token } from "@cryptoalgebra/custom-pools-sdk";

export const STABLECOINS = {
    [ChainId.BaseSepolia]: {
        USDC: new Token(ChainId.BaseSepolia, "0xAbAc6f23fdf1313FC2E9C9244f666157CcD32990", 6, "USDC", "USDC"),
        ALGB: new Token(ChainId.BaseSepolia, "0x253f3460BC16074B960f80421d72E6FA6Ef786c8", 18, "ALGB", "ALGB"),
    },
};
