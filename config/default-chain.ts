import { ChainId } from "@cryptoalgebra/integral-sdk";

export const CHAIN_NAME = {
    [ChainId.AlpenTestnet]: "Alpen Testnet",
};

export const NATIVE_SYMBOL = {
    [ChainId.AlpenTestnet]: "sBTC",
};

export const NATIVE_NAME = {
    [ChainId.AlpenTestnet]: "Signet BTC",
};

export const CHAIN_ID = {
    [ChainId.AlpenTestnet]: ChainId.AlpenTestnet,
};

export const CHAIN_IMAGE = {
    [ChainId.AlpenTestnet]: "https://avatars.githubusercontent.com/u/113091135",
};

export const DEFAULT_CHAIN_ID = ChainId.AlpenTestnet;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
