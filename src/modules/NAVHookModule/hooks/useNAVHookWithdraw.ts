import { priceConvergenceVaultDepositGuardAbi } from "@/generated";
import { useApprove } from "@/hooks/common/useApprove";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useUserSlippageToleranceWithDefault } from "@/state/userStore";
import { ApprovalState } from "@/types/approve-state";
import { CurrencyAmount } from "@cryptoalgebra/integral-sdk";
import { useCallback, useMemo, useState } from "react";
import { Address, zeroAddress } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { applySlippage, DEFAULT_NAV_HOOK_SLIPPAGE, getPercentAmount } from "../utils";
import { useNAVHookPool } from "./useNAVHookPool";
import { useNAVHookVaultState } from "./useNAVHookVaultState";

interface UseNAVHookWithdrawArgs {
    poolId: Address | undefined;
    percent: number;
    onSuccess?: () => void;
}

export function useNAVHookWithdraw({ poolId, percent, onSuccess }: UseNAVHookWithdrawArgs) {
    const { address: account } = useAccount();
    const { vaultAddress, guardAddress, token0, token1 } = useNAVHookPool(poolId);
    const vaultState = useNAVHookVaultState(poolId, account);
    const vaultShareToken = useCurrency(vaultAddress, false);
    const publicClient = usePublicClient();
    const slippage = useUserSlippageToleranceWithDefault(DEFAULT_NAV_HOOK_SLIPPAGE);
    const [error, setError] = useState<string | null>(null);

    const sharesToWithdrawRaw = useMemo(() => getPercentAmount(vaultState.userShares, percent), [percent, vaultState.userShares]);
    const sharesToApprove = useMemo(
        () => (vaultShareToken ? CurrencyAmount.fromRawAmount(vaultShareToken, sharesToWithdrawRaw.toString()) : undefined),
        [sharesToWithdrawRaw, vaultShareToken],
    );

    const { approvalState, approvalCallback } = useApprove(sharesToApprove, guardAddress ?? zeroAddress);
    const { data: hash, writeContractAsync, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useTransactionAwait(hash, {
        title: "Withdraw NAV liquidity",
        tokenA: token0?.wrapped.address as Address,
        tokenB: token1?.wrapped.address as Address,
        type: TransactionType.POOL,
        callback: onSuccess,
    });

    const withdraw = useCallback(async () => {
        if (!guardAddress || !account || !publicClient || sharesToWithdrawRaw === 0n) return;

        setError(null);

        try {
            const simulation = await publicClient.simulateContract({
                account,
                address: guardAddress,
                abi: priceConvergenceVaultDepositGuardAbi,
                functionName: "withdraw",
                args: [sharesToWithdrawRaw, account, 0n, 0n],
            });

            await writeContractAsync({
                address: guardAddress,
                abi: priceConvergenceVaultDepositGuardAbi,
                functionName: "withdraw",
                args: [
                    sharesToWithdrawRaw,
                    account,
                    applySlippage(simulation.result[0], slippage),
                    applySlippage(simulation.result[1], slippage),
                ],
            });
        } catch (withdrawError) {
            console.error("NAV Hook withdraw failed", withdrawError);
            setError("Withdrawal failed. Please check the selected amount and try again.");
        }
    }, [account, guardAddress, publicClient, sharesToWithdrawRaw, slippage, writeContractAsync]);

    return {
        withdraw,
        approveShares: approvalCallback,
        approvalState,
        isApproved: approvalState === ApprovalState.APPROVED,
        isPending: isPending || isConfirming,
        isSuccess,
        error,
        sharesToWithdrawRaw,
    };
}
