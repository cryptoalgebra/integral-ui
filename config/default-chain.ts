import { ChainId } from "@cryptoalgebra/integral-sdk";

export const CHAIN_NAME = {
    [ChainId.Ethereum]: "Ethereum",
};

export const NATIVE_SYMBOL = {
    [ChainId.Ethereum]: "ETH",
};

export const NATIVE_NAME = {
    [ChainId.Ethereum]: "Ethereum",
};

export const CHAIN_ID = {
    [ChainId.Ethereum]: ChainId.Ethereum,
};

export const CHAIN_IMAGE = {
    [ChainId.Ethereum]: "/eth-diamond.svg",
    // [ChainId.Ethereum]: "https://www.ethereum-ecosystem.com/logo.webp",
};

export const DEFAULT_CHAIN_ID = ChainId.Ethereum;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
