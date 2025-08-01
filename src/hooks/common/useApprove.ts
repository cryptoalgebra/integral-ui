import { useEffect, useMemo, useState } from "react";
import { Currency, CurrencyAmount, Percent, Trade, TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { SmartRouter, SmartRouterTrade } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";

import { DEFAULT_CHAIN_ID, SWAP_ROUTER } from "config";
import { ApprovalState, ApprovalStateType } from "@/types/approve-state";

import { useNeedAllowance } from "./useNeedAllowance";
import { useTransactionAwait } from "./useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore.ts";
import { formatBalance } from "@/utils/common/formatBalance.ts";
import { Address, erc20Abi } from "viem";
import { useWriteContract } from "wagmi";

export function useApprove(amountToApprove: CurrencyAmount<Currency> | undefined, spender: Address) {
    const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined;
    const [shouldPolling, setShouldPolling] = useState(false);

    const needAllowance = useNeedAllowance(token, amountToApprove, spender, shouldPolling);

    const approvalState: ApprovalStateType = useMemo(() => {
        if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
        if (amountToApprove.currency.isNative) return ApprovalState.APPROVED;

        return needAllowance ? ApprovalState.NOT_APPROVED : ApprovalState.APPROVED;
    }, [amountToApprove, needAllowance, spender]);

    const config = amountToApprove
        ? {
              address: amountToApprove.currency.wrapped.address as Address,
              abi: erc20Abi,
              functionName: "approve" as const,
              args: [spender, BigInt(amountToApprove.quotient.toString())] as [Address, bigint],
          }
        : undefined;

    const { data: approvalData, writeContract: approve, isPending } = useWriteContract();

    const { isLoading, isSuccess } = useTransactionAwait(approvalData, {
        title: `Approve ${formatBalance(amountToApprove?.toSignificant() as string)} ${amountToApprove?.currency.symbol}`,
        tokenA: token?.address as Address,
        type: TransactionType.SWAP,
    });

    useEffect(() => {
        if (!needAllowance && shouldPolling) {
            setShouldPolling(false);
        }
    }, [needAllowance, shouldPolling]);

    const approvalCallback = () => {
        if (config) {
            setShouldPolling(true);
            approve(config);
        }
    };

    return {
        approvalState:
            isLoading || isPending
                ? ApprovalState.PENDING
                : isSuccess && approvalState === ApprovalState.APPROVED
                  ? ApprovalState.APPROVED
                  : approvalState,
        approvalCallback,
    };
}

export function useApproveCallbackFromTrade(
    trade: SmartRouterTrade<TradeType> | Trade<Currency, Currency, TradeType> | null | undefined,
    allowedSlippage: Percent
) {
    const isSmartTrade = trade && "routes" in trade;

    const amountToApprove = useMemo(
        () =>
            trade && trade.inputAmount.currency.isToken
                ? isSmartTrade
                    ? SmartRouter.maximumAmountIn(trade, allowedSlippage)
                    : trade.maximumAmountIn(allowedSlippage)
                : undefined,
        [trade, allowedSlippage, isSmartTrade]
    );
    return useApprove(amountToApprove, SWAP_ROUTER[amountToApprove?.currency.chainId || DEFAULT_CHAIN_ID]);
}
