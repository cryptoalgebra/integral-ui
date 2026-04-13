import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export const CHAIN_NAME = {
    [ChainId.BSC]: "Binance Smart Chain",
};

export const NATIVE_SYMBOL = {
    [ChainId.BSC]: "BNB",
};

export const NATIVE_NAME = {
    [ChainId.BSC]: "BNB",
};

export const CHAIN_ID = {
    [ChainId.BSC]: ChainId.BSC,
};

export const CHAIN_IMAGE = {
    [ChainId.BSC]: "https://bscscan.com/assets/bsc/images/svg/logos/chain-light.svg",
};

export const DEFAULT_CHAIN_ID = ChainId.BSC;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
