import { ADDRESS_ZERO, ChainId } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

export type PoolDeployerType = "BASE_DYNAMIC" | "BASE_03" | "BASE_1" | "ALL_INCLUSIVE";

export const CUSTOM_POOL_DEPLOYER_ADDRESSES: Record<PoolDeployerType, Record<number, Address | null>> = {
    BASE_DYNAMIC: {
        [ChainId.BaseSepolia]: ADDRESS_ZERO,
    },
    BASE_03: {
        [ChainId.BaseSepolia]: '0xa972B8650e5c4Db00Cb78c8E208AC7B38Ac1c189'
    },
    BASE_1: {
        [ChainId.BaseSepolia]: '0x5f3b3cff2dD159c3A28402527cfE72BC175A0bb4'
    },
    /* Replace with `null` to use as a stub */
    ALL_INCLUSIVE: {
        [ChainId.BaseSepolia]: "0x80968dCD8e9bFA7E4c0332E4a3220C69C2F244D8",
    },
} as const;

export const CUSTOM_POOL_DEPLOYER_TITLES: Record<PoolDeployerType, string> = {
    BASE_DYNAMIC: "Dynamic",
    BASE_03: "0.3%",
    BASE_1: "1%",
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
