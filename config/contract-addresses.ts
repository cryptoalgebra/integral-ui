import { ADDRESS_ZERO, ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.HyperEvmTestnet]: "0xF7531f3a21C13278498Be17a91d3B4976869C850",
};

export const QUOTER_V2: Record<number, Address> = {
    [ChainId.HyperEvmTestnet]: "0x7fcf8285C55De6A9E84C161F38aC7C1f4BB181ec",
};

export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.HyperEvmTestnet]: "0x665fb349C40496884C5362De5FD2114b6791a5aF",
};

export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.HyperEvmTestnet]: "0x67C15BafDaE1e1BE7Fd94f43d89370Cb5a2548B6",
};

export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.HyperEvmTestnet]: "0x1c4AB01E74Af8227275cc9d533FC3EDf2cE5e698",
};

export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.HyperEvmTestnet]: "0x78747014562Cd35420076361244e21749aD74F98",
};

export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.HyperEvmTestnet]: ADDRESS_ZERO,
};
