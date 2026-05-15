import { ChainId } from "@cryptoalgebra/integral-sdk";

export const CHAIN_NAME = {
    [ChainId.GiwaSepolia]: "Giwa Sepolia",
};

export const NATIVE_SYMBOL = {
    [ChainId.GiwaSepolia]: "ETH",
};

export const NATIVE_NAME = {
    [ChainId.GiwaSepolia]: "Ethereum",
};

export const CHAIN_ID = {
    [ChainId.GiwaSepolia]: ChainId.GiwaSepolia,
};

export const CHAIN_IMAGE = {
    [ChainId.GiwaSepolia]: "https://static.giwa.io/logos/red_icon.svg",
};

export const DEFAULT_CHAIN_ID = ChainId.GiwaSepolia;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
