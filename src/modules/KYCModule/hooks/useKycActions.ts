import {
    gatewayAbi,
    identityAbi,
    useReadGatewayApprovedSigners,
    useReadIdentityKeyHasPurpose,
    useWriteGatewayDeployIdentityWithSalt,
    useWriteIdentityAddClaim,
    useWriteIdentityRemoveClaim,
} from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { CLAIM_ISSUER, GATEWAY } from "config";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Hex, encodeAbiParameters, keccak256, maxUint256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import { KycIdentityState } from "../types";
import { getClaimDigest, getGatewayAuthorizationDigest } from "../utils";
import { CLAIM_DATA, CLAIM_SCHEME, CLAIM_URI } from "../constants";

const CLAIM_KEY_PURPOSE = 3n;

function getDemoPrivateKey(value: string | undefined): Hex | undefined {
    return value && /^0x[0-9a-fA-F]{64}$/.test(value) ? (value as Hex) : undefined;
}

const DEMO_SIGNER_PRIVATE_KEY = getDemoPrivateKey(import.meta.env.VITE_KYC_DEMO_SIGNER_PRIVATE_KEY);

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "KYC transaction could not be prepared.";
}

export function useKycActions(identity: KycIdentityState, onStatusChange?: () => void) {
    const chainId = useChainId();
    const { address: account } = useAccount();
    const publicClient = usePublicClient();
    const gatewayAddress = GATEWAY[chainId];
    const claimIssuerAddress = CLAIM_ISSUER[chainId];

    const deployWrite = useWriteGatewayDeployIdentityWithSalt();
    const claimWrite = useWriteIdentityAddClaim();
    const removeWrite = useWriteIdentityRemoveClaim();
    const [error, setError] = useState<string>();
    const identityRefetch = identity.refetch;

    useEffect(() => {
        setError(undefined);
    }, [account, chainId]);

    const demoSigner = useMemo(() => (DEMO_SIGNER_PRIVATE_KEY ? privateKeyToAccount(DEMO_SIGNER_PRIVATE_KEY) : undefined), []);
    const demoSignerKey = useMemo(
        () => (demoSigner ? keccak256(encodeAbiParameters([{ type: "address" }], [demoSigner.address])) : undefined),
        [demoSigner],
    );

    const demoSignerApprovedRead = useReadGatewayApprovedSigners({
        args: demoSigner ? [demoSigner.address] : undefined,
        query: { enabled: Boolean(gatewayAddress && demoSigner) },
    });
    const demoSignerPurposeRead = useReadIdentityKeyHasPurpose({
        address: claimIssuerAddress,
        args: demoSignerKey ? [demoSignerKey, CLAIM_KEY_PURPOSE] : undefined,
        query: { enabled: Boolean(claimIssuerAddress && demoSignerKey) },
    });

    const refreshStatus = useCallback(() => {
        void identityRefetch();
        onStatusChange?.();
    }, [identityRefetch, onStatusChange]);
    const transactionInfo = useMemo(
        () => ({ title: "Demo KYC", type: TransactionType.KYC, callback: refreshStatus }),
        [refreshStatus],
    );
    const deployReceipt = useTransactionAwait(deployWrite.data, { ...transactionInfo, description: "Deploying your Onchain ID" });
    const claimReceipt = useTransactionAwait(claimWrite.data, { ...transactionInfo, description: "Adding your KYC claim" });
    const removeReceipt = useTransactionAwait(removeWrite.data, { ...transactionInfo, description: "Removing your KYC claim" });

    const deployIdentity = useCallback(async () => {
        setError(undefined);

        try {
            if (!account || !publicClient || !gatewayAddress) {
                throw new Error("Connect a wallet on a supported network.");
            }
            if (!demoSigner) throw new Error("The Demo KYC signer is not configured.");
            if (demoSignerApprovedRead.isLoading) {
                throw new Error("The Demo KYC signer is still being checked.");
            }
            if (demoSignerApprovedRead.isError) {
                throw new Error("The Demo KYC signer could not be checked.");
            }
            if (demoSignerApprovedRead.data !== true) {
                throw new Error("The Demo KYC signer is not approved by the Gateway.");
            }

            const salt = account;
            const signatureExpiry = maxUint256;
            const digest = getGatewayAuthorizationDigest(account, salt, signatureExpiry);
            const signature = await demoSigner.signMessage({ message: { raw: digest } });

            const { request } = await publicClient.simulateContract({
                account,
                address: gatewayAddress,
                abi: gatewayAbi,
                functionName: "deployIdentityWithSalt",
                args: [account, salt, signatureExpiry, signature],
            });
            deployWrite.writeContract(request);
        } catch (cause) {
            setError(getErrorMessage(cause));
        }
    }, [
        account,
        demoSigner,
        demoSignerApprovedRead.data,
        demoSignerApprovedRead.isError,
        demoSignerApprovedRead.isLoading,
        deployWrite,
        gatewayAddress,
        publicClient,
    ]);

    const addClaim = useCallback(async () => {
        setError(undefined);

        try {
            if (!account || !publicClient || !claimIssuerAddress) {
                throw new Error("Connect a wallet on a supported network.");
            }
            if (!demoSigner) throw new Error("The Demo KYC signer is not configured.");
            if (!identity.identityAddress) throw new Error("The user Identity contract is not ready.");
            if (demoSignerPurposeRead.isLoading) {
                throw new Error("The Demo KYC signer is still being checked.");
            }
            if (demoSignerPurposeRead.isError) {
                throw new Error("The Demo KYC signer could not be checked.");
            }
            if (demoSignerPurposeRead.data !== true) {
                throw new Error("The Demo KYC signer is not a claim key of the ClaimIssuer contract.");
            }

            if (identity.topic === undefined) throw new Error("The required claim topic is not available.");

            const digest = getClaimDigest(identity.identityAddress, identity.topic, CLAIM_DATA);
            const signature = await demoSigner.signMessage({
                message: { raw: digest },
            });
            const isValid = await publicClient.readContract({
                address: claimIssuerAddress,
                abi: identityAbi,
                functionName: "isClaimValid",
                args: [identity.identityAddress, identity.topic, signature, CLAIM_DATA],
            });
            if (!isValid) throw new Error("The configured signer is not a valid claim key for the ClaimIssuer Identity.");

            const { request } = await publicClient.simulateContract({
                account,
                address: identity.identityAddress,
                abi: identityAbi,
                functionName: "addClaim",
                args: [identity.topic, CLAIM_SCHEME, claimIssuerAddress, signature, CLAIM_DATA, CLAIM_URI],
            });
            claimWrite.writeContract(request);
        } catch (cause) {
            setError(getErrorMessage(cause));
        }
    }, [
        account,
        claimIssuerAddress,
        claimWrite,
        demoSigner,
        demoSignerPurposeRead.data,
        demoSignerPurposeRead.isError,
        demoSignerPurposeRead.isLoading,
        identity.identityAddress,
        identity.topic,
        publicClient,
    ]);

    const removeClaim = useCallback(async () => {
        setError(undefined);

        try {
            if (!account || !publicClient || !identity.identityAddress || !identity.claimId) {
                throw new Error("The KYC claim is not available.");
            }

            const { request } = await publicClient.simulateContract({
                account,
                address: identity.identityAddress,
                abi: identityAbi,
                functionName: "removeClaim",
                args: [identity.claimId],
            });
            removeWrite.writeContract(request);
        } catch (cause) {
            setError(getErrorMessage(cause));
        }
    }, [account, identity.claimId, identity.identityAddress, publicClient, removeWrite]);

    const clearError = useCallback(() => setError(undefined), []);
    const resetSession = useCallback(() => setError(undefined), []);

    return {
        deployIdentity,
        addClaim,
        removeClaim,
        error,
        clearError,
        resetSession,
        isDeploying: deployWrite.isPending || deployReceipt.isLoading,
        isAddingClaim: claimWrite.isPending || claimReceipt.isLoading,
        isRemovingClaim: removeWrite.isPending || removeReceipt.isLoading,
    };
}
