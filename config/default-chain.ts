import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export const CHAIN_NAME = {
    [ChainId.CitreaMainnet]: "Citrea",
};

export const NATIVE_SYMBOL = {
    [ChainId.CitreaMainnet]: "WCBTC",
};

export const NATIVE_NAME = {
    [ChainId.CitreaMainnet]: "WCBTC",
};

export const CHAIN_ID = {
    [ChainId.CitreaMainnet]: ChainId.CitreaMainnet,
};

export const CHAIN_IMAGE = {
    [ChainId.CitreaMainnet]: "https://www.ethereum-ecosystem.com/logos/base_icon.png",
};

export const DEFAULT_CHAIN_ID = ChainId.CitreaMainnet;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
