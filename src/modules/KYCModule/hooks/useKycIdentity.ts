import {
    useReadIdentityGetClaim,
    useReadIdentityIsClaimValid,
    useReadIidFactoryGetIdentity,
    useReadOnchainIdAllowlistCheckerIdentityFactory,
    useReadOnchainIdAllowlistCheckerIsTrustedIssuer,
    useReadOnchainIdAllowlistCheckerRequiredTopic,
} from "@/generated";
import { CLAIM_ISSUER, IID_FACTORY, ONCHAIN_ID_ALLOWLIST_CHECKER } from "config";
import { Address, Hex, zeroAddress } from "viem";
import { useAccount, useChainId } from "wagmi";
import { KycIdentityState, KycStatus, KycStatusType } from "../types";
import { getClaimId } from "../utils";

export function useKycIdentity(enabled = true): KycIdentityState {
    const chainId = useChainId();
    const { address: account } = useAccount();
    const claimIssuerAddress = CLAIM_ISSUER[chainId];
    const checkerAddress = ONCHAIN_ID_ALLOWLIST_CHECKER[chainId];
    const configuredIdentityFactory = IID_FACTORY[chainId];

    const topicRead = useReadOnchainIdAllowlistCheckerRequiredTopic({
        query: { enabled: Boolean(enabled && checkerAddress) },
    });
    const checkerIdentityFactoryRead = useReadOnchainIdAllowlistCheckerIdentityFactory({
        query: { enabled: Boolean(enabled && checkerAddress) },
    });
    const trustedIssuerRead = useReadOnchainIdAllowlistCheckerIsTrustedIssuer({
        args: claimIssuerAddress ? [claimIssuerAddress] : undefined,
        query: { enabled: Boolean(enabled && checkerAddress && claimIssuerAddress) },
    });
    const topic = topicRead.data;

    const identityRead = useReadIidFactoryGetIdentity({
        args: account ? [account] : undefined,
        query: { enabled: Boolean(enabled && account) },
    });

    const identityAddress = identityRead.data && identityRead.data !== zeroAddress ? (identityRead.data as Address) : undefined;
    const claimId = claimIssuerAddress && topic !== undefined ? getClaimId(claimIssuerAddress, topic) : undefined;

    const claimRead = useReadIdentityGetClaim({
        address: identityAddress,
        args: claimId ? [claimId] : undefined,
        query: { enabled: Boolean(enabled && identityAddress && claimId) },
    });

    const claim = claimRead.data as readonly [bigint, bigint, Address, Hex, Hex, string] | undefined;
    const hasExpectedClaim = Boolean(
        claim &&
            topic !== undefined &&
            claim[0] === topic &&
            claimIssuerAddress &&
            claim[2].toLowerCase() === claimIssuerAddress.toLowerCase(),
    );

    const validityRead = useReadIdentityIsClaimValid({
        address: claimIssuerAddress,
        args:
            hasExpectedClaim && identityAddress && claim
                ? [identityAddress, topic!, claim[3], claim[4]]
                : undefined,
        query: { enabled: Boolean(enabled && hasExpectedClaim && identityAddress && claimIssuerAddress) },
    });

    const isLoading = Boolean(
        enabled &&
            account &&
            (topicRead.isLoading ||
                checkerIdentityFactoryRead.isLoading ||
                trustedIssuerRead.isLoading ||
                identityRead.isLoading ||
                (identityAddress && claimRead.isLoading) ||
                (hasExpectedClaim && validityRead.isLoading)),
    );
    const hasReadError =
        topicRead.isError ||
        checkerIdentityFactoryRead.isError ||
        trustedIssuerRead.isError ||
        identityRead.isError ||
        claimRead.isError ||
        validityRead.isError;

    let status: KycStatusType = KycStatus.CHECKING;
    let configError: string | undefined;

    if (!enabled) {
        status = KycStatus.NOT_REQUIRED;
    } else if (!claimIssuerAddress || !checkerAddress || !configuredIdentityFactory) {
        status = KycStatus.ERROR;
        configError = "Demo KYC is not configured for this network.";
    } else if (
        checkerIdentityFactoryRead.data &&
        checkerIdentityFactoryRead.data.toLowerCase() !== configuredIdentityFactory.toLowerCase()
    ) {
        status = KycStatus.ERROR;
        configError = "The configured Identity Factory does not match the KYC checker.";
    } else if (trustedIssuerRead.data === false) {
        status = KycStatus.ERROR;
        configError = "The Demo KYC ClaimIssuer is not trusted by the KYC checker.";
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
        topic,
        checkerAddress,
        configError,
        isLoading,
        refetch: async () =>
            Promise.all([
                identityRead.refetch(),
                topicRead.refetch(),
                checkerIdentityFactoryRead.refetch(),
                claimIssuerAddress ? trustedIssuerRead.refetch() : Promise.resolve(),
                identityAddress ? claimRead.refetch() : Promise.resolve(),
                hasExpectedClaim ? validityRead.refetch() : Promise.resolve(),
            ]),
    };
}
