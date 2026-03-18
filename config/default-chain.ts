import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export const CHAIN_NAME = {
    [ChainId.Rayls]: "Rayls",
    [ChainId.RaylsDevnet]: "Rayls",
};

export const NATIVE_SYMBOL = {
    [ChainId.Rayls]: "ETH",
    [ChainId.Rayls]: "USDR",
};

export const NATIVE_NAME = {
    [ChainId.Rayls]: "ETH",
    [ChainId.Rayls]: "USDR",
};

export const CHAIN_ID = {
    [ChainId.Rayls]: ChainId.Rayls,
    [ChainId.RaylsDevnet]: ChainId.RaylsDevnet,
};

export const CHAIN_IMAGE = {
    [ChainId.Rayls]: "https://testnet-explorer.rayls.com/assets/configs/network_icon.svg",
    [ChainId.RaylsDevnet]: "https://testnet-explorer.rayls.com/assets/configs/network_icon.svg",
};

export const DEFAULT_CHAIN_ID = ChainId.RaylsDevnet;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
