import { priceConvergenceVaultDepositGuardAbi } from "@/generated";
import { useApprove } from "@/hooks/common/useApprove";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useUserSlippageToleranceWithDefault } from "@/state/userStore";
import { ApprovalState } from "@/types/approve-state";
import { Currency, CurrencyAmount } from "@cryptoalgebra/integral-sdk";
import { useCallback, useMemo, useState } from "react";
import { Address, zeroAddress } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { applySlippage, DEFAULT_NAV_HOOK_SLIPPAGE } from "../utils";
import { useNAVHookPool } from "./useNAVHookPool";

interface UseNAVHookDepositArgs {
    poolId: Address | undefined;
    amount0: CurrencyAmount<Currency> | undefined;
    amount1: CurrencyAmount<Currency> | undefined;
    onSuccess?: () => void;
}

export function useNAVHookDeposit({ poolId, amount0, amount1, onSuccess }: UseNAVHookDepositArgs) {
    const { address: account } = useAccount();
    const { guardAddress, token0, token1 } = useNAVHookPool(poolId);
    const publicClient = usePublicClient();
    const slippage = useUserSlippageToleranceWithDefault(DEFAULT_NAV_HOOK_SLIPPAGE);
    const [error, setError] = useState<string | null>(null);
    const amount0Key = amount0?.quotient.toString();
    const amount1Key = amount1?.quotient.toString();
    const amount0Raw = useMemo(() => (amount0Key ? BigInt(amount0Key) : 0n), [amount0Key]);
    const amount1Raw = useMemo(() => (amount1Key ? BigInt(amount1Key) : 0n), [amount1Key]);

    const { approvalState: token0ApprovalState, approvalCallback: approveToken0 } = useApprove(amount0, guardAddress ?? zeroAddress);
    const { approvalState: token1ApprovalState, approvalCallback: approveToken1 } = useApprove(amount1, guardAddress ?? zeroAddress);

    const { data: hash, writeContractAsync, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useTransactionAwait(hash, {
        title: "Add NAV liquidity",
        tokenA: token0?.wrapped.address as Address,
        tokenB: token1?.wrapped.address as Address,
        type: TransactionType.POOL,
        callback: onSuccess,
    });

    const deposit = useCallback(async () => {
        if (!guardAddress || !account || !publicClient) return;
        if (amount0Raw + amount1Raw === 0n) return;

        setError(null);

        try {
            const simulation = await publicClient.simulateContract({
                account,
                address: guardAddress,
                abi: priceConvergenceVaultDepositGuardAbi,
                functionName: "deposit",
                args: [amount0Raw, amount1Raw, 0n, account],
            });
            const minimumShares = applySlippage(simulation.result, slippage);

            await writeContractAsync({
                address: guardAddress,
                abi: priceConvergenceVaultDepositGuardAbi,
                functionName: "deposit",
                args: [amount0Raw, amount1Raw, minimumShares, account],
            });
        } catch (depositError) {
            console.error("NAV Hook deposit failed", depositError);
            setError("Deposit failed. Please check the entered amounts and try again.");
        }
    }, [account, amount0Raw, amount1Raw, guardAddress, publicClient, slippage, writeContractAsync]);

    return {
        deposit,
        approveToken0,
        approveToken1,
        token0ApprovalState,
        token1ApprovalState,
        isToken0Approved: amount0Raw === 0n || token0ApprovalState === ApprovalState.APPROVED,
        isToken1Approved: amount1Raw === 0n || token1ApprovalState === ApprovalState.APPROVED,
        isPending: isPending || isConfirming,
        isSuccess,
        error,
    };
}
