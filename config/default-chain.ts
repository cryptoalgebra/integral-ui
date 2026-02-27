import { ChainId } from "@cryptoalgebra/integral-sdk";

export const CHAIN_NAME = {
    [ChainId.BaseSepolia]: "Base Sepolia",
};

export const NATIVE_SYMBOL = {
    [ChainId.BaseSepolia]: "ETH",
};

export const NATIVE_NAME = {
    [ChainId.BaseSepolia]: "Ethereum",
};

export const CHAIN_ID = {
    [ChainId.BaseSepolia]: ChainId.BaseSepolia,
};

export const CHAIN_IMAGE = {
    [ChainId.BaseSepolia]: "https://www.ethereum-ecosystem.com/logos/base_icon.png",
};

export const DEFAULT_CHAIN_ID = ChainId.BaseSepolia;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
