import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export const CHAIN_NAME = {
    [ChainId.PharosTestnet]: "Pharos Testnet",
};

export const NATIVE_SYMBOL = {
    [ChainId.PharosTestnet]: "PHRS",
};

export const NATIVE_NAME = {
    [ChainId.PharosTestnet]: "Pharos",
};

export const CHAIN_ID = {
    [ChainId.PharosTestnet]: ChainId.PharosTestnet,
};

export const CHAIN_IMAGE = {
    [ChainId.PharosTestnet]: "https://atlantic.pharosscan.xyz/images/pharos-rounded.png",
};

export const DEFAULT_CHAIN_ID = ChainId.PharosTestnet;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
