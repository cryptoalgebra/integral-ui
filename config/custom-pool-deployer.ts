import { ADDRESS_ZERO, ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { Address } from "viem";

export type PoolDeployerType = "BASE" | "ALL_INCLUSIVE";

export const CUSTOM_POOL_DEPLOYER_ADDRESSES: Record<PoolDeployerType, Record<number, Address | null>> = {
    BASE: {
        [ChainId.CitreaMainnet]: ADDRESS_ZERO,
    },
    /* Replace with `null` to use as a stub */
    ALL_INCLUSIVE: {
        [ChainId.CitreaMainnet]: "0x80968dCD8e9bFA7E4c0332E4a3220C69C2F244D8",
    },
} as const;

export const CUSTOM_POOL_DEPLOYER_TITLES: Record<PoolDeployerType, string> = {
    BASE: "Base",
    ALL_INCLUSIVE: "All-inclusive",
} as const;

export const customPoolDeployerTitleByAddress: Record<Address, string> = Object.fromEntries(
    Object.entries(CUSTOM_POOL_DEPLOYER_ADDRESSES).flatMap(([key, chainMap]) =>
        Object.values(chainMap).map((address) => [
            address?.toLowerCase(),
            CUSTOM_POOL_DEPLOYER_TITLES[key as keyof typeof CUSTOM_POOL_DEPLOYER_TITLES],
        ])
    )
);
