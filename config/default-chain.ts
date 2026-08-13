import { ChainId } from "@cryptoalgebra/integral-sdk";

export const CHAIN_NAME = {
    [ChainId.Robinhood]: "Robinhood",
};

export const NATIVE_SYMBOL = {
    [ChainId.Robinhood]: "ETH",
};

export const NATIVE_NAME = {
    [ChainId.Robinhood]: "Ethereum",
};

export const CHAIN_ID = {
    [ChainId.Robinhood]: ChainId.Robinhood,
};

export const CHAIN_IMAGE = {
    [ChainId.Robinhood]: "/robinhood.png",
};

export const DEFAULT_CHAIN_ID = ChainId.Robinhood;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
