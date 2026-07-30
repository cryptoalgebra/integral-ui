import { ChainId } from "@cryptoalgebra/integral-sdk";

export const CHAIN_NAME = {
    [ChainId.ZenithTestnet]: "Zenith EVM Testnet",
};

export const NATIVE_SYMBOL = {
    [ChainId.ZenithTestnet]: "ZTH",
};

export const NATIVE_NAME = {
    [ChainId.ZenithTestnet]: "Zenith",
};

export const CHAIN_ID = {
    [ChainId.ZenithTestnet]: ChainId.ZenithTestnet,
};

export const CHAIN_IMAGE = {
    [ChainId.ZenithTestnet]: "/zenith-logo.svg",
};

export const DEFAULT_CHAIN_ID = ChainId.ZenithTestnet;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
