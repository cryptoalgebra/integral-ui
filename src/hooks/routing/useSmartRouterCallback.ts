import { useCallback, useEffect, useMemo, useState } from "react";
import { Address, encodeFunctionData } from "viem";
import { useChainId, useContractWrite, useSendTransaction } from "wagmi";

import { ALGEBRA_ROUTER } from "@/constants/addresses";

import { useTransactionAwait } from "../common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { algebraRouterABI } from "@/abis";
import { Currency } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { formatAmount } from "@/utils/common/formatAmount";
import { useUserState } from "@/state/userStore";

export function useSmartRouterCallback(
    currencyA: Currency | undefined,
    currencyB: Currency | undefined,
    amount: string | undefined,
    calldata: Address | undefined,
    value: string | undefined
) {
    const [txHash, setTxHash] = useState<Address>();
    const chainId = useChainId();

    const { data: swapData, writeAsync } = useContractWrite({
        address: ALGEBRA_ROUTER[chainId],
        abi: algebraRouterABI,
        functionName: "multicall",
        args: calldata ? [[calldata]] : undefined,
        value: BigInt(value || 0),
    });

    useEffect(() => {
        if (swapData?.hash) {
            setTxHash(swapData.hash);
        }
    }, [swapData]);

    const { isExpertMode } = useUserState();

    const { sendTransactionAsync } = useSendTransaction();

    const expertCallback = useCallback(async () => {
        if (!chainId || !calldata || !value) {
            console.error("Invalid params", { calldata, value });
            return;
        }

        const txData = {
            to: ALGEBRA_ROUTER[chainId],
            data: encodeFunctionData({
                abi: algebraRouterABI,
                functionName: "multicall",
                args: [[calldata]],
            }),
            value: BigInt(value || 0),
            gas: BigInt(2_000_000),
        };
        try {
            const txHash = await sendTransactionAsync(txData);
            setTxHash(txHash.hash);
            console.log("Transaction Hash:", txHash.hash);
            return txHash;
        } catch (error) {
            console.error("Send transaction Error:", error);
            throw error;
        }
    }, [chainId, calldata, value, sendTransactionAsync]);

    const { isLoading } = useTransactionAwait(txHash, {
        title: `Swap ${formatAmount(amount || "0", 6)} ${currencyA?.symbol}`,
        type: TransactionType.SWAP,
        tokenA: currencyA?.wrapped.address as Address,
        tokenB: currencyB?.wrapped.address as Address,
    });

    return useMemo(
        () => ({
            callback: isExpertMode ? expertCallback : writeAsync,
            isLoading,
        }),
        [expertCallback, isExpertMode, writeAsync, isLoading]
    );
}
