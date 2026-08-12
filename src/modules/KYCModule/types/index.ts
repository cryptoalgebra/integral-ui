import { Address, Hex } from "viem";
import type { KycStatusType } from "@/types/kyc";

export { KycStatus } from "@/types/kyc";
export type { KycQuoteState, KycStatusType } from "@/types/kyc";

export interface TokenPermissionState {
    tokenAddress: Address;
    checkerAddress?: Address;
    permission: Hex;
    isPermissioned: boolean;
    canSwap: boolean;
    canAddLiquidity: boolean;
    isError: boolean;
}

export interface PoolPermissionState {
    poolAddress: Address;
    pluginAddress?: Address;
    token0?: TokenPermissionState;
    token1?: TokenPermissionState;
    hasPermissionModule: boolean;
    isPermissioned: boolean;
    canSwap: boolean;
    canAddLiquidity: boolean;
    deniedSwapTokens: Address[];
    deniedLiquidityTokens: Address[];
}

export interface PoolsPermissionsResult {
    permissionsByPool: Record<string, PoolPermissionState>;
    isLoading: boolean;
    isError: boolean;
    refetch: () => Promise<unknown>;
}

export interface KycPoolRequirement {
    isKycRequired: boolean;
    canSwap: boolean;
    canAddLiquidity: boolean;
    deniedSwapTokens: Address[];
    deniedLiquidityTokens: Address[];
    isLoading: boolean;
    isError: boolean;
    pluginAddress?: Address;
    activeModules: readonly string[];
    refetch: () => Promise<unknown>;
}

export interface KycTradeGate {
    isKycRequired: boolean;
    canSwap: boolean;
    isLoading: boolean;
    isError: boolean;
    poolAddresses: Address[];
    requiredPoolAddresses: Address[];
    deniedTokenAddresses: Address[];
    refetch: () => Promise<unknown>;
}

export interface KycIdentityState {
    status: KycStatusType;
    identityAddress?: Address;
    claimIssuerAddress?: Address;
    claimId?: Hex;
    claim?: readonly [bigint, bigint, Address, Hex, Hex, string];
    topic?: bigint;
    checkerAddress?: Address;
    configError?: string;
    isLoading: boolean;
    refetch: () => Promise<unknown>;
}
