import { useEffect, useMemo, useState } from "react";
import { Currency, CurrencyAmount, Percent, Trade, TradeType } from "@cryptoalgebra/integral-sdk";
import { SmartRouter, SmartRouterTrade } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";

import { DEFAULT_CHAIN_ID, SWAP_ROUTER, TOKENS } from "config";
import { ApprovalState, ApprovalStateType } from "@/types/approve-state";

import { useNeedAllowance } from "./useNeedAllowance";
import { useTransactionAwait } from "./useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore.ts";
import { Address, erc20Abi } from "viem";
import { useWriteContract } from "wagmi";
import { formatAmount } from "@/utils";

const TOKENS_REQUIRING_APPROVAL_RESET = new Set<string>([TOKENS[DEFAULT_CHAIN_ID].USDT.address.toLowerCase()]);

export function useApprove(amountToApprove: CurrencyAmount<Currency> | undefined, spender: Address) {
    const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined;
    const [shouldPolling, setShouldPolling] = useState(false);
    const [pendingApprovalTitle, setPendingApprovalTitle] = useState<string>();
    const amountToApproveValue = amountToApprove?.quotient.toString();

    const { needAllowance, allowance, refetchAllowance } = useNeedAllowance(token, amountToApprove, spender, true);

    const targetApprovalAmount = amountToApprove ? BigInt(amountToApprove.quotient.toString()) : undefined;

    const shouldResetApprovalBeforeIncrease = Boolean(
        token &&
            typeof allowance === "bigint" &&
            allowance > 0n &&
            targetApprovalAmount &&
            targetApprovalAmount > allowance &&
            TOKENS_REQUIRING_APPROVAL_RESET.has(token.address.toLowerCase()),
    );

    const approvalState: ApprovalStateType = useMemo(() => {
        if (!amountToApprove || !spender) return ApprovalState.UNKNOWN;
        if (amountToApprove.currency.isNative) return ApprovalState.APPROVED;
        if (shouldResetApprovalBeforeIncrease) return ApprovalState.RESET_REQUIRED;

        return needAllowance ? ApprovalState.NOT_APPROVED : ApprovalState.APPROVED;
    }, [amountToApprove, needAllowance, shouldResetApprovalBeforeIncrease, spender]);

    const config = amountToApprove
        ? {
              address: amountToApprove.currency.wrapped.address as Address,
              abi: erc20Abi,
              functionName: "approve" as const,
              args: [spender, targetApprovalAmount as bigint] as [Address, bigint],
          }
        : undefined;

    const { data: approvalData, writeContract: approve, isPending } = useWriteContract();

    const currentApprovalTitle = shouldResetApprovalBeforeIncrease
        ? `Reset ${amountToApprove?.currency.symbol} approval`
        : `Approve ${formatAmount(amountToApprove?.toSignificant(24) as string)} ${amountToApprove?.currency.symbol}`;

    const { isLoading, isSuccess } = useTransactionAwait(approvalData, {
        title: pendingApprovalTitle ?? currentApprovalTitle,
        tokenA: token?.address as Address,
        type: TransactionType.SWAP,
        callback: refetchAllowance,
    });

    useEffect(() => {
        setShouldPolling(true);
    }, [amountToApproveValue]);

    useEffect(() => {
        if (!needAllowance && shouldPolling) {
            setShouldPolling(false);
        }
    }, [needAllowance, shouldPolling]);

    const approvalCallback = () => {
        if (config) {
            setShouldPolling(true);
            setPendingApprovalTitle(currentApprovalTitle);

            if (shouldResetApprovalBeforeIncrease) {
                approve({
                    ...config,
                    args: [spender, 0n],
                });
                return;
            }

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
    allowedSlippage: Percent,
) {
    const isSmartTrade = trade && "routes" in trade;

    const amountToApprove = useMemo(
        () =>
            trade
                ? isSmartTrade
                    ? SmartRouter.maximumAmountIn(trade, allowedSlippage)
                    : trade.maximumAmountIn(allowedSlippage)
                : undefined,
        [trade, allowedSlippage, isSmartTrade],
    );
    return useApprove(amountToApprove, SWAP_ROUTER[amountToApprove?.currency.chainId || DEFAULT_CHAIN_ID]);
}

export function useRevokeApprove(token: Currency | undefined, spender: Address) {
    return useApprove(token && CurrencyAmount.fromRawAmount(token, "0"), spender);
}
