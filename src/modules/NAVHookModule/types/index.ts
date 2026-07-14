import { Currency } from "@cryptoalgebra/integral-sdk";
import { Address } from "viem";

export interface NAVHookPoolInfo {
    isNAVHookPool: boolean;
    vaultAddress?: Address;
    guardAddress?: Address;
    token0?: Currency;
    token1?: Currency;
}

export interface NAVHookVaultState {
    userShares: bigint;
    totalSupply: bigint;
    total0: bigint;
    total1: bigint;
    userAmount0: bigint;
    userAmount1: bigint;
    shareDecimals: number;
    isLoading: boolean;
    hasPosition: boolean;
    refetch: () => void;
}
