import { Currency, CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useAccount, useReadContract, useSignTypedData } from "wagmi";
import { PERMIT2_ABI } from "config/abis/permit2";
import { Address, UserRejectedRequestError } from "viem";
import { useCallback, useMemo, useState } from "react";
import { PERMIT2 } from "config/contract-addresses";
import { AllowanceTransfer, MaxAllowanceTransferAmount } from "@uniswap/permit2-sdk";
import { useToast } from "@/components/ui/use-toast";
import { Permit, PermitSignature, PermitState } from "../types";

const PERMIT_EXPIRATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const PERMIT_SIG_EXPIRATION = 30 * 60 * 1000; // 30 minutes

function toDeadline(expiration: number): number {
    return Math.floor((Date.now() + expiration) / 1000);
}

export type PermitStateType = PermitState.LOADING | PermitState.NOT_PERMITTED | PermitState.PERMITTED;

export function usePermit(amount: CurrencyAmount<Currency> | undefined, spender: string | undefined) {
    const { address, chainId } = useAccount();
    const token = amount?.currency.wrapped;
    const permit2Address = chainId ? (PERMIT2[chainId] as Address) : undefined;

    // Signature state
    const [signature, setSignature] = useState<PermitSignature>();

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
            // Refetch periodically to check expiration
            refetchInterval: 30000, // 30 seconds
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
    const now = useMemo(() => Math.floor(Date.now() / 1000), []);
    const isSigned = useMemo(() => {
        if (!amount || !signature) return false;
        return signature.details.token === token?.address && signature.spender === spender && signature.sigDeadline >= now;
    }, [amount, now, signature, spender, token?.address]);

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
                    amount: MaxAllowanceTransferAmount.toString(),
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
            setSignature(permitSignature);

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
    }, [address, chainId, nonce, signTypedDataAsync, spender, token, toast, permit2Address]);

    return {
        permitState,
        permitCallback,
        permitSignature: isSigned ? signature : undefined,
        refetchPermit,
    };
}
