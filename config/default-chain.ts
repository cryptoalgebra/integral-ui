import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export const CHAIN_NAME = {
    [ChainId.SophonOSTestnet]: "SophonOSTestnet",
};

export const NATIVE_SYMBOL = {
    [ChainId.SophonOSTestnet]: "SOPH",
};

export const NATIVE_NAME = {
    [ChainId.SophonOSTestnet]: "SOPH",
};

export const CHAIN_ID = {
    [ChainId.SophonOSTestnet]: ChainId.SophonOSTestnet,
};

export const CHAIN_IMAGE = {
    [ChainId.SophonOSTestnet]: "/sophon-logo.png",
};

export const DEFAULT_CHAIN_ID = ChainId.SophonOSTestnet;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
