import { Address, Hex } from "viem";
import type { KycStatusType } from "@/types/kyc";

export { KycStatus } from "@/types/kyc";
export type { KycQuoteState, KycStatusType } from "@/types/kyc";

export interface KycPoolRequirement {
    isKycRequired: boolean;
    isLoading: boolean;
    isError: boolean;
    pluginAddress?: Address;
    activeModules: readonly string[];
    refetch: () => Promise<unknown>;
}

export interface KycTradeGate {
    isKycRequired: boolean;
    isLoading: boolean;
    isError: boolean;
    poolAddresses: Address[];
    requiredPoolAddresses: Address[];
    refetch: () => Promise<unknown>;
}

export interface KycIdentityState {
    status: KycStatusType;
    identityAddress?: Address;
    claimIssuerAddress?: Address;
    claimId?: Hex;
    claim?: readonly [bigint, bigint, Address, Hex, Hex, string];
    configError?: string;
    isLoading: boolean;
    refetch: () => Promise<unknown>;
}
