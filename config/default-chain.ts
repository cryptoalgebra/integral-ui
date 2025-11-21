import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export const CHAIN_NAME = {
    [ChainId.MantraDukong]: "Mantra",
};

export const NATIVE_SYMBOL = {
    [ChainId.MantraDukong]: "OM",
};

export const NATIVE_NAME = {
    [ChainId.MantraDukong]: "OM",
};

export const CHAIN_ID = {
    [ChainId.MantraDukong]: ChainId.MantraDukong,
};

export const CHAIN_IMAGE = {
    [ChainId.MantraDukong]: "https://www.ethereum-ecosystem.com/logos/base_icon.png",
};

export const DEFAULT_CHAIN_ID = ChainId.MantraDukong;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
