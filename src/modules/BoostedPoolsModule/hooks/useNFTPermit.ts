import { useAccount, useReadContract, useSignTypedData, useChainId } from "wagmi";
import { Address, UserRejectedRequestError, parseSignature } from "viem";
import { useCallback, useMemo } from "react";
import { NONFUNGIBLE_POSITION_MANAGER } from "config/contract-addresses";
import { useToast } from "@/components/ui/use-toast";
import { nonfungiblePositionManagerABI } from "config/abis/nonfungiblePositionManager";
import { useNFTPermitStore, NFTPermitSignature, getPermitKey, isPermitValid } from "@/state/nftPermitStore";

const PERMIT_EXPIRATION = 30 * 60 * 1000; // 30 minutes

function toDeadline(expiration: number): number {
    return Math.floor((Date.now() + expiration) / 1000);
}

export enum NFTPermitState {
    LOADING = 0,
    NOT_PERMITTED = 1,
    PERMITTED = 2,
}

export type NFTPermitStateType = NFTPermitState.LOADING | NFTPermitState.NOT_PERMITTED | NFTPermitState.PERMITTED;

interface UseNFTPermitParams {
    tokenId?: string | number;
    spender?: Address;
}

export function useNFTPermit({ tokenId, spender }: UseNFTPermitParams) {
    const { address } = useAccount();
    const chainId = useChainId();

    const { setPermit, permits } = useNFTPermitStore();

    const signature = useMemo(() => {
        if (!spender || !address || tokenId === undefined) return undefined;

        const permitKey = getPermitKey(tokenId, chainId);

        const storedPermit = permits[permitKey];

        if (!storedPermit) return undefined;

        const isValid = isPermitValid(storedPermit, spender, address);

        return isValid ? storedPermit.signature : undefined;
    }, [permits, spender, address, tokenId, chainId]);

    const queryEnabled = !!tokenId;
    const { data: positionData } = useReadContract({
        address: NONFUNGIBLE_POSITION_MANAGER[chainId],
        abi: nonfungiblePositionManagerABI,
        functionName: "positions",
        args: queryEnabled ? [BigInt(tokenId)] : undefined,
        query: { enabled: queryEnabled },
    });

    const nonce = useMemo(() => {
        if (!positionData) return undefined;
        return positionData[0]; // First element is nonce (uint88)
    }, [positionData]);

    // Check if signature is valid (expiration is already checked in store)
    const isSigned = useMemo(() => {
        return !!signature;
    }, [signature]);

    // Sign typed data hook
    const { signTypedDataAsync, isPending } = useSignTypedData();
    const { toast } = useToast();

    // Determine permit state
    const permitState: NFTPermitStateType = useMemo(() => {
        if (!tokenId || !spender || !NONFUNGIBLE_POSITION_MANAGER[chainId]) return NFTPermitState.LOADING;
        if (nonce === undefined || isPending) return NFTPermitState.LOADING;

        return isSigned ? NFTPermitState.PERMITTED : NFTPermitState.NOT_PERMITTED;
    }, [tokenId, spender, chainId, nonce, isPending, isSigned]);

    // Permit callback
    const permitCallback = useCallback(async () => {
        try {
            if (!address) {
                throw new Error("Wallet not connected");
            }
            if (!chainId) {
                throw new Error("Connected to an unsupported network");
            }
            if (!tokenId) {
                throw new Error("Missing token ID");
            }
            if (!spender) {
                throw new Error("Missing spender address");
            }
            if (nonce === undefined) {
                throw new Error("Missing nonce");
            }
            if (!NONFUNGIBLE_POSITION_MANAGER[chainId]) {
                throw new Error("Missing NFT Position Manager address");
            }

            const deadline = toDeadline(PERMIT_EXPIRATION);

            // EIP-712 Domain
            const domain = {
                name: "Algebra Positions NFT-V2",
                version: "2",
                chainId,
                verifyingContract: NONFUNGIBLE_POSITION_MANAGER[chainId],
            };

            // EIP-712 Types
            const types = {
                Permit: [
                    { name: "spender", type: "address" },
                    { name: "tokenId", type: "uint256" },
                    { name: "nonce", type: "uint256" },
                    { name: "deadline", type: "uint256" },
                ],
            };

            // Values to sign
            const values = {
                spender,
                tokenId: BigInt(tokenId),
                nonce,
                deadline: BigInt(deadline),
            };

            // Sign
            const signatureResult = await signTypedDataAsync({
                domain,
                types,
                primaryType: "Permit",
                message: values,
            });

            const { r, s, v } = parseSignature(signatureResult);

            const permitResult: NFTPermitSignature = {
                r,
                s,
                v: Number(v),
                deadline,
            };

            setPermit({
                tokenId: tokenId.toString(),
                chainId,
                spender,
                signature: permitResult,
                owner: address,
            });

            // Show success toast
            toast({
                title: "NFT Permit Signed Successfully",
                description: "You can now proceed with removing liquidity",
            });

            return permitResult;
        } catch (error) {
            if (error instanceof UserRejectedRequestError) {
                toast({
                    title: "Permit Rejected",
                    description: "You rejected the permit signature",
                    variant: "destructive",
                });
                throw new Error("User rejected permit request");
            }
            toast({
                title: "Permit Failed",
                description: error instanceof Error ? error.message : "Failed to sign NFT permit",
                variant: "destructive",
            });

            console.log(error);
            throw error;
        }
    }, [address, chainId, tokenId, spender, nonce, signTypedDataAsync, toast, setPermit]);

    return {
        permitState,
        permitCallback,
        permitSignature: isSigned ? signature : undefined,
        isLoading: isPending,
    };
}
