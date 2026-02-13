import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export const CHAIN_NAME = {
    [ChainId.MegaethMainnet]: "MegaETH Mainnet",
    [ChainId.MegaethTestnet]: "MegaETH Testnet",
};

export const NATIVE_SYMBOL = {
    [ChainId.MegaethMainnet]: "ETH",
    [ChainId.MegaethTestnet]: "ETH",
};

export const NATIVE_NAME = {
    [ChainId.MegaethMainnet]: "Ethereum",
    [ChainId.MegaethTestnet]: "Ethereum",
};

export const CHAIN_ID = {
    [ChainId.MegaethMainnet]: ChainId.MegaethMainnet,
    [ChainId.MegaethTestnet]: ChainId.MegaethTestnet,
};

export const CHAIN_IMAGE = {
    [ChainId.MegaethMainnet]: "https://www.ethereum-ecosystem.com/logos/ethereum_icon.png",
    [ChainId.MegaethTestnet]: "https://www.ethereum-ecosystem.com/logos/ethereum_icon.png",
};

export const DEFAULT_CHAIN_ID = ChainId.MegaethMainnet;
export const DEFAULT_CHAIN_NAME = CHAIN_NAME[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_SYMBOL = NATIVE_SYMBOL[DEFAULT_CHAIN_ID];
export const DEFAULT_NATIVE_NAME = NATIVE_NAME[DEFAULT_CHAIN_ID];
