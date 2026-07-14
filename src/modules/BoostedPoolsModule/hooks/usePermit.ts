import { Currency, CurrencyAmount } from "@cryptoalgebra/integral-sdk";
import { useAccount, useReadContract, useSignTypedData } from "wagmi";
import { PERMIT2_ABI } from "config/abis/permit2";
import { Address, UserRejectedRequestError } from "viem";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PERMIT2 } from "config/contract-addresses";
import { AllowanceTransfer } from "@uniswap/permit2-sdk";
import { useToast } from "@/components/ui/use-toast";
import { Permit, PermitSignature, PermitState } from "../types";

const PERMIT_EXPIRATION = 60 * 60 * 1000; // 60 minutes
const PERMIT_SIG_EXPIRATION = 2 * 60 * 1000; // 2 minutes

function toDeadline(expiration: number): number {
    return Math.floor((Date.now() + expiration) / 1000);
}

export type PermitStateType = PermitState.LOADING | PermitState.NOT_PERMITTED | PermitState.PERMITTED;

type SignedPermitState = {
    signature: PermitSignature;
    address: Address;
    chainId: number;
};

export function usePermit(amount: CurrencyAmount<Currency> | undefined, spender: string | undefined) {
    const { address, chainId } = useAccount();
    const token = amount?.currency.wrapped;
    const tokenAddress = token?.address;
    const permit2Address = chainId ? (PERMIT2[chainId] as Address) : undefined;

    // Signature state
    const [signedPermit, setSignedPermit] = useState<SignedPermitState>();

    // Check Permit2 allowance
    const queryEnabled = !!address && !!token?.address && !!spender && !!permit2Address;
    const { data: permitData, refetch: refetchPermit } = useReadContract({
        address: permit2Address,
        abi: PERMIT2_ABI,
        chainId: token?.chainId,
        functionName: "allowance",
        args: queryEnabled ? [address as Address, token.address as Address, spender as Address] : undefined,
        query: {
            enabled: queryEnabled,
        },
    });

    const { permitAllowance, expiration: permitExpiration, nonce } = useMemo(() => {
        if (!permitData || !token) {
            return { permitAllowance: undefined, expiration: undefined, nonce: undefined };
        }

        const [allowanceAmount, expiration, nonce] = permitData;
        const allowance = CurrencyAmount.fromRawAmount(token, allowanceAmount.toString());

        return { permitAllowance: allowance, expiration, nonce };
    }, [permitData, token]);

    // Check if signature is valid
    const now = Math.floor(Date.now() / 1000);
    const isSigned = useMemo(() => {
        if (!amount || !signedPermit) return false;

        const { signature, address: signedAddress, chainId: signedChainId } = signedPermit;

        return (
            signedAddress === address &&
            signedChainId === chainId &&
            signature.details.token.toLowerCase() === tokenAddress?.toLowerCase() &&
            signature.spender === spender &&
            BigInt(signature.details.amount.toString()) >= BigInt(amount.quotient.toString()) &&
            signature.sigDeadline >= now
        );
    }, [address, amount, chainId, now, signedPermit, spender, tokenAddress]);

    // Check if permit is valid
    const isPermitted = useMemo(() => {
        if (!amount || !permitAllowance || !permitExpiration) return false;
        return (permitAllowance.greaterThan(amount) || permitAllowance.equalTo(amount)) && permitExpiration >= now;
    }, [amount, now, permitAllowance, permitExpiration]);

    // Sign typed data hook
    const { signTypedDataAsync, isPending } = useSignTypedData();
    const { toast } = useToast();

    // Determine permit state
    const permitState: PermitStateType = useMemo(() => {
        if (!amount || !spender || !permit2Address) return PermitState.LOADING;
        if (permitAllowance === undefined || isPending) return PermitState.LOADING;

        return isPermitted || isSigned ? PermitState.PERMITTED : PermitState.NOT_PERMITTED;
    }, [amount, spender, permit2Address, permitAllowance, isPermitted, isSigned, isPending]);

    // Permit callback
    const permitCallback = useCallback(async () => {
        try {
            if (!address) {
                throw new Error("wallet not connected");
            }
            if (!chainId) {
                throw new Error("connected to an unsupported network");
            }
            if (!token) {
                throw new Error("missing token");
            }
            if (!amount) {
                throw new Error("missing amount");
            }
            if (!spender) {
                throw new Error("missing spender");
            }
            if (nonce === undefined) {
                throw new Error("missing nonce");
            }
            if (!permit2Address) {
                throw new Error("missing permit2 address");
            }

            const permit: Permit = {
                details: {
                    token: token.address,
                    amount: amount.quotient.toString(),
                    expiration: toDeadline(PERMIT_EXPIRATION),
                    nonce,
                },
                spender,
                sigDeadline: toDeadline(PERMIT_SIG_EXPIRATION),
            };

            const { domain, types, values } = AllowanceTransfer.getPermitData(permit, permit2Address as string, chainId);

            const signatureResult = await signTypedDataAsync({
                domain: {
                    name: domain.name,
                    version: domain.version,
                    chainId: Number(chainId),
                    verifyingContract: domain.verifyingContract as Address,
                },
                types: {
                    PermitSingle: types.PermitSingle,
                    PermitDetails: types.PermitDetails,
                },
                primaryType: "PermitSingle",
                message: values as any,
            });

            const permitSignature = { ...permit, signature: signatureResult };
            setSignedPermit({ signature: permitSignature, address, chainId });

            // Show success toast
            toast({
                title: "Permit Signed Successfully",
                description: "You can now proceed with the swap",
            });
        } catch (error) {
            if (error instanceof UserRejectedRequestError) {
                toast({
                    title: "Permit Rejected",
                    description: "You rejected the permit signature",
                    variant: "destructive",
                });
                throw new Error("user rejected request");
            }
            toast({
                title: "Permit Failed",
                description: error instanceof Error ? error.message : "Failed to sign permit",
                variant: "destructive",
            });
            throw error;
        }
    }, [address, amount, chainId, nonce, signTypedDataAsync, spender, token, toast, permit2Address]);

    const removePermitSign = useCallback(() => {
        setSignedPermit(undefined);
    }, []);

    useEffect(() => {
        if (!signedPermit) return;

        const signatureExpiredIn = signedPermit.signature.sigDeadline * 1000 - Date.now();
        if (signatureExpiredIn <= 0) {
            removePermitSign();
            return;
        }

        const timeout = setTimeout(removePermitSign, signatureExpiredIn);
        return () => clearTimeout(timeout);
    }, [removePermitSign, signedPermit]);

    useEffect(() => {
        if (!signedPermit) return;

        const { signature, address: signedAddress, chainId: signedChainId } = signedPermit;
        const contextChanged = signedAddress !== address || signedChainId !== chainId;
        const tokenChanged = !!tokenAddress && signature.details.token.toLowerCase() !== tokenAddress.toLowerCase();
        const spenderChanged = !!spender && signature.spender.toLowerCase() !== spender.toLowerCase();

        if (contextChanged || tokenChanged || spenderChanged) {
            removePermitSign();
        }
    }, [address, chainId, removePermitSign, signedPermit, spender, tokenAddress]);

    return {
        permitState,
        permitCallback,
        permitSignature: isSigned ? signedPermit?.signature : undefined,
        refetchPermit,
        removePermitSign,
    };
}
