import { Position } from "@cryptoalgebra/custom-pools-sdk";
import { useAccount, useChainId, useEstimateGas, useSendTransaction } from "wagmi";
import {  useEffect, useMemo } from "react";
import { useTransactionAwait } from "../common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Address } from "viem";
import { OMEGA_ROUTER } from "config/contract-addresses";
import { MintOptions, OmegaRouter } from "omega-router-sdk/src/omegaRouter";

export enum MintCallbackState {
    INVALID = "INVALID",
    VALID = "VALID",
}

export function useOmegaMintCallback(
    position: Position | null | undefined,
    options: MintOptions | null | undefined,
    poolAddress?: Address
) {
    const { address: account } = useAccount();
    const chainId = useChainId();

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
            title: "Add liquidity",
            tokenA: position?.pool.token0.wrapped.address as Address,
            tokenB: position?.pool.token1.wrapped.address as Address,
            type: TransactionType.POOL,
        },
        poolAddress ? `/pool/${poolAddress}` : undefined
    );

    useEffect(() => {
        if (error) {
            console.error(error);
        }
    }, [error]);

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
