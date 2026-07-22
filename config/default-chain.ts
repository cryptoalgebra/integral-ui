import { ChainId } from "@cryptoalgebra/integral-sdk";

export const CHAIN_NAME = {
    [ChainId.Base]: "Base",
};

export const NATIVE_SYMBOL = {
    [ChainId.Base]: "ETH",
};

export const NATIVE_NAME = {
    [ChainId.Base]: "Ethereum",
};

export const CHAIN_ID = {
    [ChainId.Base]: ChainId.Base,
};

export const CHAIN_IMAGE = {
    [ChainId.Base]: "https://basescan.org/assets/base/images/svg/logos/chain-light.svg?v=",
};

export const DEFAULT_CHAIN_ID = ChainId.Base;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
