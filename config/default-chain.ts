import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export const CHAIN_NAME = {
    [ChainId.Base]: "Base",
    [ChainId.BaseSepolia]: "Base Sepolia",
};

export const NATIVE_SYMBOL = {
    [ChainId.Base]: "ETH",
    [ChainId.BaseSepolia]: "ETH",
};

export const NATIVE_NAME = {
    [ChainId.Base]: "Ethereum",
    [ChainId.BaseSepolia]: "Ethereum",
};

export const CHAIN_ID = {
    [ChainId.Base]: ChainId.Base,
    [ChainId.BaseSepolia]: ChainId.BaseSepolia,
};

export const CHAIN_IMAGE = {
    [ChainId.Base]: "https://img.bgstatic.com/multiLang/web/c7997ea06626549b27fb32066afa7063.png",
    [ChainId.BaseSepolia]: "https://www.ethereum-ecosystem.com/logos/base_icon.png",
};

export const DEFAULT_CHAIN_ID = ChainId.Base;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
