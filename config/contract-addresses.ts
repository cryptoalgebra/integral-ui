import { ADDRESS_ZERO, ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

export const ALGEBRA_FACTORY: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xE4e7d1b09faE61B12F07EF86ED7eC590F1B6c6CF",
};

export const QUOTER_V2: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xeaA2385078D9e5eccda27Bb8BFF5BC256Aac80c1",
};

export const SWAP_ROUTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x8A310D66d06c1FE28AfE61e0130B5FF00afCb223",
};

export const NONFUNGIBLE_POSITION_MANAGER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x07b10e41B97aC181143698964f7bBBb7969C3cC6",
};

export const ALGEBRA_ETERNAL_FARMING: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0x3f8350ae86E7ABbE67B1f5Fd1CA6E85c309d4e21",
};

export const FARMING_CENTER: Record<number, Address> = {
    [ChainId.BaseSepolia]: "0xd5FBdE38734a2E8f28B12B12A3A617979bDe953E",
};

export const LIMIT_ORDER_MANAGER: Record<number, Address> = {
    [ChainId.BaseSepolia]: ADDRESS_ZERO,
};
