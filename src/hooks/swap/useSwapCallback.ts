import { Currency, Percent, Trade, TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { useAccount, useChainId, usePublicClient } from "wagmi";
import { useSwapCallArguments } from "./useSwapCallArguments";
import { useEffect, useMemo, useState } from "react";
import { SwapCallbackState } from "@/types/swap-state";
import { useTransactionAwait } from "../common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Address } from "viem";
import { useWriteSwapRouterMulticall } from "@/generated";
import { estimateContractGas } from "viem/actions";
import { SWAP_ROUTER } from "config/contract-addresses";
import { swapRouterABI } from "config/abis";
import { formatAmount } from "@/utils";

interface SwapCallEstimate {
    calldata: Address[];
    value: bigint;
}

interface SuccessfulCall extends SwapCallEstimate {
    calldata: Address[];
    value: bigint;
    gasEstimate: bigint;
}

interface FailedCall extends SwapCallEstimate {
    calldata: Address[];
    value: bigint;
    error: Error;
}

export function useSwapCallback(
    trade: Trade<Currency, Currency, TradeType> | null | undefined,
    allowedSlippage: Percent,
    onTransactionSuccess?: () => void
) {
    const { address: account } = useAccount();

    const chainId = useChainId();
    const client = usePublicClient({ chainId });

    const [bestCall, setBestCall] = useState<SuccessfulCall>();
    const [callError, setCallError] = useState<Error>();

    const swapCalldata = useSwapCallArguments(trade, allowedSlippage);

    useEffect(() => {
        async function findBestCall() {
            if (!swapCalldata || swapCalldata.length === 0 || swapCalldata.every((call) => call.calldata.length === 0)) return;
            if (!account || !client) return;

            setBestCall(undefined);
            setCallError(undefined);

            const calls = await Promise.all(
                swapCalldata.map(async ({ calldata, value: _value }) => {
                    const value = BigInt(_value);

                    try {
                        const gasEstimate = await estimateContractGas(client, {
                            address: SWAP_ROUTER[chainId],
                            abi: swapRouterABI,
                            functionName: "multicall",
                            args: [calldata],
                            account,
                            value,
                        });

                        return { calldata, value, gasEstimate };
                    } catch (error) {
                        // console.error(error);
                        return { calldata, value, error: error as Error };
                    }
                })
            );

            const successfulCalls = calls.filter((call): call is SuccessfulCall => "gasEstimate" in call);

            if (successfulCalls.length === 0) {
                const errors = calls.filter((call): call is FailedCall => "error" in call);
                setCallError(errors[0].error);
                throw errors.length > 0 ? errors[errors.length - 1].error : new Error("All gas estimations failed.");
            }

            const bestCallOption = successfulCalls.reduce((a, b) => (a.gasEstimate < b.gasEstimate ? a : b));

            setBestCall(bestCallOption);
        }

        findBestCall();
    }, [swapCalldata, account, chainId, client]);

    const swapConfig = useMemo(
        () =>
            bestCall
                ? {
                      args: [bestCall.calldata] as const,
                      value: BigInt(bestCall.value),
                      gas: (bestCall.gasEstimate * (10000n + 2000n)) / 10000n,
                  }
                : undefined,
        [bestCall]
    );

    const { data: swapData, writeContractAsync: swapCallback, isPending } = useWriteSwapRouterMulticall();

    const { isLoading, isSuccess } = useTransactionAwait(swapData, {
        title: `Swap ${formatAmount(trade?.inputAmount.toSignificant() as string)} ${trade?.inputAmount.currency.symbol}`,
        tokenA: trade?.inputAmount.currency.wrapped.address as Address,
        tokenB: trade?.outputAmount.currency.wrapped.address as Address,
        type: TransactionType.SWAP,
        callback: onTransactionSuccess,
    });

    return useMemo(() => {
        if (!trade && trade !== null)
            return {
                state: SwapCallbackState.INVALID,
                callback: null,
                error: "No trade was found",
                isLoading: false,
                isSuccess: false,
            };

        return {
            state: SwapCallbackState.VALID,
            callback: () => swapConfig && swapCallback(swapConfig),
            error: callError?.message.split(":")[1].split("Contract Call")[0],
            isLoading: isLoading || isPending,
            isSuccess,
        };
    }, [trade, callError?.message, isLoading, isPending, isSuccess, swapConfig, swapCallback]);
}
