import { Token } from "@cryptoalgebra/custom-pools-sdk";

// Hyperliquid Mainnet Chain ID
const HYPERLIQUID_CHAIN_ID = 999;
const BASE_SEPOLIA_CHAIN_ID = 84532;

// Hyperliquid Mainnet Tokens
export const HYPERLIQUID_TOKENS = {
    // Native and Wrapped Native
    HYPE: new Token(HYPERLIQUID_CHAIN_ID, "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", 18, "HYPE", "Hype"),
    WHYPE: new Token(HYPERLIQUID_CHAIN_ID, "0x5555555555555555555555555555555555555555", 18, "WHYPE", "Wrapped Hype"),

    // Stablecoins
    USDC: new Token(HYPERLIQUID_CHAIN_ID, "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359", 6, "USDC", "USD Coin"),
    USDE: new Token(HYPERLIQUID_CHAIN_ID, "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", 18, "USDe", "USDeOFT"),
    USDT0: new Token(HYPERLIQUID_CHAIN_ID, "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb", 6, "USDT0", "USDT0"),

    // Wrapped Assets
    UETH: new Token(HYPERLIQUID_CHAIN_ID, "0xbe6727b535545c67d5caa73dea54865b92cf7907", 18, "UETH", "Unit Ethereum"),
    UBTC: new Token(HYPERLIQUID_CHAIN_ID, "0x9fdbda0a5e284c32744d2f17ee5c74b284993463", 8, "UBTC", "Unit Bitcoin"),
    USOL: new Token(HYPERLIQUID_CHAIN_ID, "0x068f321fa8fb9f0d135f290ef6a3e2813e1c8a29", 9, "USOL", "Unit Solana"),

    // Other tokens
    KHYPE: new Token(HYPERLIQUID_CHAIN_ID, "0xfD739d4e423301CE9385c1fb8850539D657C296D", 18, "KHYPE", "KHYPE"),
    LHYPE: new Token(HYPERLIQUID_CHAIN_ID, "0x5748ae796AE46A4F1348a1693de4b50560485562", 18, "LHYPE", "Looped Hype"),
    UFART: new Token(HYPERLIQUID_CHAIN_ID, "0x3b4575e689ded21caad31d64c4df1f10f3b2cedf", 6, "UFART", "Unit Fartcoin"),
    // BUDDY: new Token(HYPERLIQUID_CHAIN_ID, "0x7CDD2Ae72f6CD65E975d6827ed5973f45cf8D9Aa", 18, "BUDDY", "Buddy"),
};

// Base Sepolia Tokens (for testing)
export const BASE_SEPOLIA_TOKENS = {
    USDC: new Token(BASE_SEPOLIA_CHAIN_ID, "0xAbAc6f23fdf1313FC2E9C9244f666157CcD32990", 6, "USDC", "USDC"),
};

// Stablecoins mapping for backward compatibility
export const STABLECOINS = {
    [BASE_SEPOLIA_CHAIN_ID]: {
        USDC: BASE_SEPOLIA_TOKENS.USDC,
    },
    [HYPERLIQUID_CHAIN_ID]: {
        USDC: HYPERLIQUID_TOKENS.USDC,
        USDE: HYPERLIQUID_TOKENS.USDE,
        USDT0: HYPERLIQUID_TOKENS.USDT0,
    },
};

// Common tokens mapping
export const COMMON_TOKENS = {
    [HYPERLIQUID_CHAIN_ID]: {
        WHYPE: HYPERLIQUID_TOKENS.WHYPE,
        USDC: HYPERLIQUID_TOKENS.USDC,
        USDE: HYPERLIQUID_TOKENS.USDE,
        UETH: HYPERLIQUID_TOKENS.UETH,
        UBTC: HYPERLIQUID_TOKENS.UBTC,
    },
    [BASE_SEPOLIA_CHAIN_ID]: {
        USDC: BASE_SEPOLIA_TOKENS.USDC,
    },
};

// Token list for UI display
export const TOKEN_LIST = {
    [HYPERLIQUID_CHAIN_ID]: Object.values(HYPERLIQUID_TOKENS),
    [BASE_SEPOLIA_CHAIN_ID]: Object.values(BASE_SEPOLIA_TOKENS),
};
