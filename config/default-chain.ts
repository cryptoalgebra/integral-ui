import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export const CHAIN_NAME = {
    [ChainId.HyperEvmMainnet]: "Hyperliquid",
    [ChainId.BaseSepolia]: "Base Sepolia",
};

export const NATIVE_SYMBOL = {
    [ChainId.HyperEvmMainnet]: "HYPE",
    [ChainId.BaseSepolia]: "ETH",
};

export const NATIVE_NAME = {
    [ChainId.HyperEvmMainnet]: "Hype",
    [ChainId.BaseSepolia]: "Ethereum",
};

export const CHAIN_ID = {
    [ChainId.HyperEvmMainnet]: ChainId.HyperEvmMainnet,
    [ChainId.BaseSepolia]: ChainId.BaseSepolia,
};

export const DEFAULT_CHAIN_ID = 999; // Hyperliquid Mainnet
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
