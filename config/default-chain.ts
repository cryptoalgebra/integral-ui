import { ChainId } from "@cryptoalgebra/integral-sdk";

export const CHAIN_NAME = {
    [ChainId.Hemi]: "Hemi",
};

export const NATIVE_SYMBOL = {
    [ChainId.Hemi]: "ETH",
};

export const NATIVE_NAME = {
    [ChainId.Hemi]: "Ethereum",
};

export const CHAIN_ID = {
    [ChainId.Hemi]: ChainId.Hemi,
};

export const CHAIN_IMAGE = {
    [ChainId.Hemi]: "/hemi-logo-orange.svg",
};

export const DEFAULT_CHAIN_ID = ChainId.Hemi;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
