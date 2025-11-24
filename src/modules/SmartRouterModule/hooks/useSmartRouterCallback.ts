import { useEffect, useMemo, useState } from "react";
import { Address } from "viem";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { formatAmount } from "@/utils/common/formatAmount";
import { useWriteSwapRouterMulticall } from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";

export function useSmartRouterCallback(
    currencyA: Currency | undefined,
    currencyB: Currency | undefined,
    amount: string | undefined,
    calldata: Address | undefined,
    value: string | undefined,
    onTransactionSuccess?: () => void
) {
    const [txHash, setTxHash] = useState<Address>();

    const config = useMemo(
        () =>
            calldata
                ? {
                      args: [[calldata]] as const,
                      value: BigInt(value || 0),
                  }
                : undefined,
        [calldata, value]
    );

    const { data: swapData, writeContractAsync: writeAsync, isPending } = useWriteSwapRouterMulticall();

    useEffect(() => {
        if (swapData) {
            setTxHash(swapData);
        }
    }, [swapData]);

    // const { isExpertMode } = useUserState();

    // const { sendTransactionAsync } = useSendTransaction();

    // const expertCallback = useCallback(async () => {
    //     if (!chainId || !calldata || !value) {
    //         console.error("Invalid params", { calldata, value });
    //         return;
    //     }

    //     const txData = {
    //         to: SWAP_ROUTER[chainId],
    //         data: encodeFunctionData({
    //             abi: swapRouterABI,
    //             functionName: "multicall",
    //             args: [[calldata]],
    //         }),
    //         value: BigInt(value || 0),
    //         gas: BigInt(1_000_000),
    //     };
    //     console.log(txData);
    //     try {
    //         const txHash = await sendTransactionAsync(txData);
    //         setTxHash(txHash);
    //         console.log("Transaction Hash:", txHash);
    //         return txHash;
    //     } catch (error) {
    //         console.error("Send transaction Error:", error);
    //         throw error;
    //     }
    // }, [chainId, calldata, value, sendTransactionAsync]);

    const { isLoading } = useTransactionAwait(txHash, {
        title: `Swap ${formatAmount(amount || "0", 6)} ${currencyA?.symbol}`,
        type: TransactionType.SWAP,
        tokenA: currencyA?.wrapped.address as Address,
        tokenB: currencyB?.wrapped.address as Address,
        callback: onTransactionSuccess,
    });

    return useMemo(
        () => ({
            callback: () => config && writeAsync(config),
            isLoading: isLoading || isPending,
        }),
        [writeAsync, isLoading, config, isPending]
    );
}
