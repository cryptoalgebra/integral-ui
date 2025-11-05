import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export const CHAIN_NAME = {
    [ChainId.Rayls]: "Rayls",
};

export const NATIVE_SYMBOL = {
    [ChainId.Rayls]: "ETH",
};

export const NATIVE_NAME = {
    [ChainId.Rayls]: "ETH",
};

export const CHAIN_ID = {
    [ChainId.Rayls]: ChainId.Rayls,
};

export const CHAIN_IMAGE = {
    [ChainId.Rayls]: "https://www.ethereum-ecosystem.com/logos/base_icon.png",
};

export const DEFAULT_CHAIN_ID = ChainId.Rayls;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
