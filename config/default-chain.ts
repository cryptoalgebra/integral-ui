import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export const CHAIN_NAME = {
    [ChainId.Henesys]: "Henesys",
};

export const NATIVE_SYMBOL = {
    [ChainId.Henesys]: "NXPC",
};

export const NATIVE_NAME = {
    [ChainId.Henesys]: "NXPC",
};

export const CHAIN_ID = {
    [ChainId.Henesys]: ChainId.Henesys,
};

export const CHAIN_IMAGE = {
    [ChainId.Henesys]: "./chain-image.png",
};

export const DEFAULT_CHAIN_ID = ChainId.Henesys;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
