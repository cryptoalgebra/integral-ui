import { Currency, Percent, Trade, TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { useAccount, useChainId, usePublicClient, useSendTransaction } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { SwapCallbackState } from "@/types/swap-state";
import { useTransactionAwait } from "../../../hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Address } from "viem";
import { estimateGas } from "viem/actions";
import { OMEGA_ROUTER } from "config/contract-addresses";
import { formatAmount } from "@/utils";
import { useOmegaSwapCallArguments } from "./useOmegaSwapCallArguments";
import { PermitSignature } from "../types";

interface SwapCallEstimate {
    calldata: Address;
    value: bigint;
}

interface SuccessfulCall extends SwapCallEstimate {
    calldata: Address;
    value: bigint;
    gasEstimate: bigint;
}

// interface FailedCall extends SwapCallEstimate {
//     calldata: Address;
//     value: bigint;
//     error: Error;
// }

export function useOmegaSwapCallback(
    trade: Trade<Currency, Currency, TradeType> | null | undefined,
    allowedSlippage: Percent,
    permitSignature?: PermitSignature,
    stepAmountsOut?: string[] | null,
    onTransactionSuccess?: () => void
) {
    const { address: account } = useAccount();

    const chainId = useChainId();
    const client = usePublicClient({ chainId });

    const [bestCall, setBestCall] = useState<SuccessfulCall>();
    const [callError, setCallError] = useState<Error>();

    const { data: swapCalldata } = useOmegaSwapCallArguments(trade, allowedSlippage, permitSignature, stepAmountsOut);

    useEffect(() => {
        async function findBestCall() {
            if (!swapCalldata?.calldata || swapCalldata.calldata.length === 0) return;
            if (!account || !client) return;

            setBestCall(undefined);
            setCallError(undefined);

            try {
                const gasEstimate = await estimateGas(client, {
                    to: OMEGA_ROUTER[chainId],
                    data: swapCalldata.calldata as Address,
                    account,
                    value: BigInt(swapCalldata.value),
                });

                setBestCall({ calldata: swapCalldata.calldata as Address, value: BigInt(swapCalldata.value), gasEstimate });
            } catch (error) {
                console.error(error);
                setCallError(error as Error);
            }
        }

        findBestCall();
    }, [swapCalldata, account, chainId, client]);

    const swapConfig = useMemo(
        () =>
            bestCall
                ? {
                      to: OMEGA_ROUTER[chainId],
                      data: bestCall.calldata as Address,
                      value: BigInt(bestCall.value),
                      gas: (bestCall.gasEstimate * (10000n + 2000n)) / 10000n,
                  }
                : undefined,
        [bestCall, chainId]
    );

    const { data: swapData, sendTransactionAsync: swapCallback, isPending } = useSendTransaction();

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
            error: callError?.message.split(":")[1]?.split("Contract Call")[0],
            isLoading: isLoading || isPending,
            isSuccess,
        };
    }, [trade, callError?.message, isLoading, isPending, isSuccess, swapConfig, swapCallback]);
}
