import { Address } from "viem";

export const KycStatus = {
    NOT_REQUIRED: "NOT_REQUIRED",
    CHECKING: "CHECKING",
    IDENTITY_REQUIRED: "IDENTITY_REQUIRED",
    CLAIM_REQUIRED: "CLAIM_REQUIRED",
    VERIFIED: "VERIFIED",
    INVALID_CLAIM: "INVALID_CLAIM",
    ERROR: "ERROR",
} as const;

export type KycStatusType = (typeof KycStatus)[keyof typeof KycStatus];

export interface KycQuoteState {
    hasKycRoutes: boolean;
    hasLockedKycRoutes: boolean;
    requiredPoolAddresses: Address[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => Promise<unknown>;
}

export const EMPTY_KYC_QUOTE_STATE: KycQuoteState = {
    hasKycRoutes: false,
    hasLockedKycRoutes: false,
    requiredPoolAddresses: [],
    isLoading: false,
    isError: false,
    refetch: async () => undefined,
};
