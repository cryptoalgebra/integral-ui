import { ADDRESS_ZERO, ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

export type PoolDeployerType = "BASE" | "LIMIT_ORDERS" | "ALM" | "AI";

export const CUSTOM_POOL_DEPLOYER_ADDRESSES: Record<PoolDeployerType, Record<number, Address>> = {
    BASE: {
        [ChainId.Base]: ADDRESS_ZERO,
        [ChainId.BaseSepolia]: ADDRESS_ZERO,
    },
    /* Replace with `null` to use as a stub */
    LIMIT_ORDERS: {
        [ChainId.Base]: "0xf3b57fe4d5d0927c3a5e549cb6af1866687e2d62",
        [ChainId.BaseSepolia]: "0x9089f3440c8e7534afcfec2b731c4d6b78876308",
    },
    ALM: {
        [ChainId.Base]: "0x05f3bd357d47d159ac7d33f9dbaacfc65d31976d",
        [ChainId.BaseSepolia]: null,
    },
    AI: {
        [ChainId.Base]: "0x8af296FcA616376aBbB3Ac78bD319bfbe4aF5503",
        [ChainId.BaseSepolia]: null,
    },
} as const;

export const CUSTOM_POOL_DEPLOYER_TITLES: Record<PoolDeployerType, string> = {
    BASE: "Base",
    LIMIT_ORDERS: "Limit Orders",
    ALM: "ALM",
    AI: "AI",
} as const;

export const customPoolDeployerTitleByAddress: Record<Address, string> = Object.fromEntries(
    Object.entries(CUSTOM_POOL_DEPLOYER_ADDRESSES).flatMap(([key, chainMap]) =>
        Object.values(chainMap).map((address) => [
            address?.toLowerCase(),
            CUSTOM_POOL_DEPLOYER_TITLES[key as keyof typeof CUSTOM_POOL_DEPLOYER_TITLES],
        ])
    )
);
