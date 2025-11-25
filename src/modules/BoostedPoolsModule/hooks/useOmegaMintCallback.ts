import { Position } from "@cryptoalgebra/custom-pools-sdk";
import { useAccount, useChainId, useEstimateGas, useSendTransaction } from "wagmi";
import {  useEffect, useMemo } from "react";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Address } from "viem";
import { OMEGA_ROUTER } from "config/contract-addresses";
import { OmegaMintOptions, OmegaRouter } from "@cryptoalgebra/omega-router-sdk";
import { usePosition, usePositions } from "@/hooks/positions/usePositions";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";

export enum MintCallbackState {
    INVALID = "INVALID",
    VALID = "VALID",
}

export function useOmegaMintCallback(
    position: Position | null | undefined,
    options: OmegaMintOptions | null | undefined,
    poolAddress?: Address,
    onSuccess?: () => void
) {
    const { address: account } = useAccount();
    const chainId = useChainId();

    const tokenId = options?.tokenId ? Number(options.tokenId) : undefined;
    const isIncreaseMode = tokenId !== undefined;

    const { refetch: refetchAllPositions } = usePositions();
    const { refetch: refetchPosition } = usePosition(tokenId);

    const mintConfig = useMemo(() => {
        if (!position || !options || !account) return undefined;
        const mintCalldata = OmegaRouter.addCallParameters(position, options);

        return {
            to: OMEGA_ROUTER[chainId],
            data: mintCalldata.calldata as `0x${string}`,
            value: BigInt(mintCalldata.value || 0),
        }
    }, [position, options, account, chainId]);

    const { data: mintData, sendTransactionAsync: mintCallback, isPending } = useSendTransaction();

    const { error } = useEstimateGas(mintConfig)

    const { isLoading, isSuccess } = useTransactionAwait(
        mintData,
        {
            title: isIncreaseMode ? `Add Liquidity to #${tokenId}` : "Add liquidity",
            tokenA: position?.pool.token0.wrapped.address as Address,
            tokenB: position?.pool.token1.wrapped.address as Address,
            type: TransactionType.POOL,
        },
        isIncreaseMode ? undefined : (poolAddress ? `/pool/${poolAddress}` : undefined)
    );

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

    useEffect(() => {
        if (!isSuccess) return;
        if (isIncreaseMode) {
            Promise.all([refetchPosition(), refetchAllPositions()]).then(() => onSuccess?.());
        }
    }, [isSuccess, isIncreaseMode, refetchPosition, refetchAllPositions, onSuccess]);

    return useMemo(() => {
        if (!position || !options) {
            return {
                state: MintCallbackState.INVALID,
                callback: null,
                error: "No position data",
                isLoading: false,
                isSuccess: false,
            };
        }

        if (!mintConfig) {
            return {
                state: MintCallbackState.INVALID,
                callback: null,
                error: "Failed to generate calldata",
                isLoading: false,
                isSuccess: false,
            };
        }

        return {
            state: MintCallbackState.VALID,
            callback: () => mintCallback(mintConfig),
            error: error?.message.split(":")[1]?.split("Contract Call")[0],
            isLoading: isLoading || isPending,
            isSuccess,
        };
    }, [position, options, error?.message, isLoading, isPending, isSuccess, mintCallback, mintConfig]);
}
