import {
    useReadIdentityGetClaim,
    useReadIdentityIsClaimValid,
    useReadIidFactoryGetIdentity,
} from "@/generated";
import { CLAIM_ISSUER } from "config";
import { Address, Hex, zeroAddress } from "viem";
import { useAccount, useChainId } from "wagmi";
import { KycIdentityState, KycStatus, KycStatusType } from "../types";
import { getClaimId } from "../utils";

const KYC_TOPIC = 42n;

export function useKycIdentity(enabled = true): KycIdentityState {
    const chainId = useChainId();
    const { address: account } = useAccount();
    const claimIssuerAddress = CLAIM_ISSUER[chainId];

    const identityRead = useReadIidFactoryGetIdentity({
        args: account ? [account] : undefined,
        query: { enabled: Boolean(enabled && account) },
    });

    const identityAddress = identityRead.data && identityRead.data !== zeroAddress ? (identityRead.data as Address) : undefined;
    const claimId = claimIssuerAddress ? getClaimId(claimIssuerAddress, KYC_TOPIC) : undefined;

    const claimRead = useReadIdentityGetClaim({
        address: identityAddress,
        args: claimId ? [claimId] : undefined,
        query: { enabled: Boolean(enabled && identityAddress && claimId) },
    });

    const claim = claimRead.data as readonly [bigint, bigint, Address, Hex, Hex, string] | undefined;
    const hasExpectedClaim = Boolean(
        claim &&
            claim[0] === KYC_TOPIC &&
            claimIssuerAddress &&
            claim[2].toLowerCase() === claimIssuerAddress.toLowerCase(),
    );

    const validityRead = useReadIdentityIsClaimValid({
        address: claimIssuerAddress,
        args:
            hasExpectedClaim && identityAddress && claim
                ? [identityAddress, KYC_TOPIC, claim[3], claim[4]]
                : undefined,
        query: { enabled: Boolean(enabled && hasExpectedClaim && identityAddress && claimIssuerAddress) },
    });

    const isLoading = Boolean(
        enabled &&
            account &&
            (identityRead.isLoading || (identityAddress && claimRead.isLoading) || (hasExpectedClaim && validityRead.isLoading)),
    );
    const hasReadError = identityRead.isError || claimRead.isError || validityRead.isError;

    let status: KycStatusType = KycStatus.CHECKING;
    let configError: string | undefined;

    if (!enabled) {
        status = KycStatus.NOT_REQUIRED;
    } else if (!claimIssuerAddress) {
        status = KycStatus.ERROR;
        configError = "Demo KYC is not configured for this network.";
    } else if (hasReadError) {
        status = KycStatus.ERROR;
    } else if (!account || isLoading) {
        status = KycStatus.CHECKING;
    } else if (!identityAddress) {
        status = KycStatus.IDENTITY_REQUIRED;
    } else if (!claim || claim[0] === 0n) {
        status = KycStatus.CLAIM_REQUIRED;
    } else if (!hasExpectedClaim || validityRead.data !== true) {
        status = KycStatus.INVALID_CLAIM;
    } else {
        status = KycStatus.VERIFIED;
    }

    return {
        status,
        identityAddress,
        claimIssuerAddress,
        claimId,
        claim,
        configError,
        isLoading,
        refetch: async () =>
            Promise.all([
                identityRead.refetch(),
                identityAddress ? claimRead.refetch() : Promise.resolve(),
                hasExpectedClaim ? validityRead.refetch() : Promise.resolve(),
            ]),
    };
}
