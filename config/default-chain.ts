import { ChainId } from "@cryptoalgebra/integral-sdk";

export const CHAIN_NAME = {
    [ChainId.ADI]: "ADI Mainnet",
};

export const NATIVE_SYMBOL = {
    [ChainId.ADI]: "ADI",
};

export const NATIVE_NAME = {
    [ChainId.ADI]: "ADI",
};

export const CHAIN_ID = {
    [ChainId.ADI]: ChainId.ADI,
};

export const CHAIN_IMAGE = {
    [ChainId.ADI]: "/eth-diamond.svg",
    // [ChainId.ADI]: "https://www.ethereum-ecosystem.com/logo.webp",
};

export const DEFAULT_CHAIN_ID = ChainId.ADI;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
