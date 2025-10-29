import { ChainId, Token, WNATIVE } from "@cryptoalgebra/custom-pools-sdk";

export const TOKENS = {
    [ChainId.Base]: {
        USDC: new Token(ChainId.Base, "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", 6, "USDC", "USDC"),
    },
    [ChainId.BaseSepolia]: {
        USDC: new Token(ChainId.BaseSepolia, "0xAbAc6f23fdf1313FC2E9C9244f666157CcD32990", 6, "USDC", "USDC"),
    },
};

export const BOOSTED_TOKENS = {
    [ChainId.BaseSepolia]: {
        wUSDC: new Token(ChainId.BaseSepolia, "0x77A0f2eac777f6fd7723787783EAE3cbC11a45d1", 18, "wUSDC", "Wrapped USDC Vault"),
        wWETH: new Token(ChainId.BaseSepolia, "0x44161e373eb4b3891AB9750F53341AAFc4Db40Aa", 18, "wWETH", "Wrapped USDC Vault"),
    },
};

export const BOOSTED_TOKEN_MAPPING = {
    [ChainId.BaseSepolia]: {
        [TOKENS[ChainId.BaseSepolia].USDC.address]: {
            wrapped: BOOSTED_TOKENS[ChainId.BaseSepolia].wUSDC,
            underlying: TOKENS[ChainId.BaseSepolia].USDC,
        },
        [WNATIVE[ChainId.BaseSepolia].address]: {
            wrapped: BOOSTED_TOKENS[ChainId.BaseSepolia].wWETH,
            underlying: WNATIVE[ChainId.BaseSepolia],
        },
    },
};
