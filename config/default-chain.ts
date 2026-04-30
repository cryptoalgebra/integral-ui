import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export const CHAIN_NAME = {
    [ChainId.RaylsMainnet]: "RaylsMainnet",
};

export const NATIVE_SYMBOL = {
    [ChainId.RaylsMainnet]: "USDr",
};

export const NATIVE_NAME = {
    [ChainId.RaylsMainnet]: "USD Rayls",
};

export const CHAIN_ID = {
    [ChainId.RaylsMainnet]: ChainId.RaylsMainnet,
};

export const CHAIN_IMAGE = {
    [ChainId.RaylsMainnet]: "/network-logo.svg",
};

export const DEFAULT_CHAIN_ID = ChainId.RaylsMainnet;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
