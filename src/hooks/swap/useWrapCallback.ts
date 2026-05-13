import { Currency, CurrencyAmount, WNATIVE, tryParseAmount } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { useTransactionAwait } from "../common/useTransactionAwait";
import { DEFAULT_NATIVE_SYMBOL, WNATIVE_EXTENDED } from "config";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Address } from "viem";
import { useWriteWa7A5Unwrap, useWriteWa7A5Wrap, useWriteWrappedNativeDeposit, useWriteWrappedNativeWithdraw } from "@/generated";
import { useApprove } from "@/hooks/common/useApprove";
import { ApprovalState, ApprovalStateType } from "@/types/approve-state";
import { getWa7A5PairTokens, getWa7A5WrapDirection, Wa7A5WrapDirection } from "@/utils/swap/wa7a5";

export const WrapType = {
    NOT_APPLICABLE: "NOT_APPLICABLE",
    WRAP: "WRAP",
    UNWRAP: "UNWRAP",
};

type WrapCallbackResult = {
    wrapType: typeof WrapType[keyof typeof WrapType];
    execute?: () => void;
    loading?: boolean;
    inputError?: string;
    approvalRequired?: boolean;
    approve?: () => void;
    approvalLoading?: boolean;
    approvalTokenSymbol?: string;
    approvalState?: ApprovalStateType;
};

const NOT_APPLICABLE: WrapCallbackResult = { wrapType: WrapType.NOT_APPLICABLE };

export default function useWrapCallback(
    inputCurrency: Currency | undefined,
    outputCurrency: Currency | undefined,
    typedValue: string | undefined,
    onTransactionSuccess?: () => void,
): WrapCallbackResult {
    const chainId = useChainId();
    const { address: account } = useAccount();

    const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue]);

    const wa7A5WrapDirection = useMemo(() => getWa7A5WrapDirection(inputCurrency, outputCurrency), [inputCurrency, outputCurrency]);
    const isWa7A5WrapOperation = wa7A5WrapDirection !== null;
    const { wa7A5Token } = getWa7A5PairTokens(chainId);

    const { approvalState: wa7A5ApprovalState, approvalCallback: approveWa7A5 } = useApprove(
        isWa7A5WrapOperation ? (inputAmount as CurrencyAmount<Currency> | undefined) : undefined,
        wa7A5Token?.address as Address,
    );

    const needsWa7A5Approval =
        isWa7A5WrapOperation && (wa7A5ApprovalState === ApprovalState.NOT_APPROVED || wa7A5ApprovalState === ApprovalState.RESET_REQUIRED);
    const isWa7A5ApprovalLoading = isWa7A5WrapOperation && wa7A5ApprovalState === ApprovalState.PENDING;

    const { data: wrapData, writeContract: wrap } = useWriteWrappedNativeDeposit();

    const { isLoading: isWrapLoading } = useTransactionAwait(wrapData, {
        title: `Wrap ${inputAmount?.toSignificant(3)} ${DEFAULT_NATIVE_SYMBOL}`,
        tokenA: WNATIVE[chainId].address as Address,
        type: TransactionType.SWAP,
        callback: onTransactionSuccess,
    });

    const { data: unwrapData, writeContract: unwrap } = useWriteWrappedNativeWithdraw();

    const { isLoading: isUnwrapLoading } = useTransactionAwait(unwrapData, {
        title: `Unwrap ${inputAmount?.toSignificant(3)} W${DEFAULT_NATIVE_SYMBOL}`,
        tokenA: WNATIVE[chainId].address as Address,
        type: TransactionType.SWAP,
        callback: onTransactionSuccess,
    });

    const { data: wa7A5WrapData, writeContract: wa7A5Wrap } = useWriteWa7A5Wrap();

    const { isLoading: isWa7A5WrapLoading } = useTransactionAwait(wa7A5WrapData, {
        title: `Wrap ${inputAmount?.toSignificant(3)} ${inputCurrency?.symbol ?? "A7A5"}`,
        tokenA: wa7A5Token?.address as Address,
        type: TransactionType.SWAP,
        callback: onTransactionSuccess,
    });

    const { data: wa7A5UnwrapData, writeContract: wa7A5Unwrap } = useWriteWa7A5Unwrap();

    const { isLoading: isWa7A5UnwrapLoading } = useTransactionAwait(wa7A5UnwrapData, {
        title: `Unwrap ${inputAmount?.toSignificant(3)} ${inputCurrency?.symbol ?? "wA7A5"}`,
        tokenA: wa7A5Token?.address as Address,
        type: TransactionType.SWAP,
        callback: onTransactionSuccess,
    });

    const { data: balance } = useBalance({
        address: inputCurrency ? account : undefined,
        token: inputCurrency?.isNative ? undefined : (inputCurrency?.address as Address),
    });

    return useMemo(() => {
        if (!chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE;
        const weth = WNATIVE_EXTENDED[chainId];

        if (!weth && !isWa7A5WrapOperation) return NOT_APPLICABLE;

        const hasInputAmount = Boolean(inputAmount?.greaterThan("0"));
        const sufficientBalance = inputAmount && balance && Number(balance.formatted) >= Number(inputAmount.toSignificant(18));

        if (inputCurrency.isNative && weth?.equals(outputCurrency)) {
            return {
                wrapType: WrapType.WRAP,
                execute:
                    sufficientBalance && inputAmount
                        ? () =>
                              wrap({
                                  address: WNATIVE[chainId]?.address as Address,
                                  value: BigInt(inputAmount.quotient.toString()),
                              })
                        : undefined,
                loading: isWrapLoading,
                inputError: sufficientBalance
                    ? undefined
                    : hasInputAmount
                    ? `Insufficient ${DEFAULT_NATIVE_SYMBOL} balance`
                    : `Enter ${DEFAULT_NATIVE_SYMBOL} amount`,
            };
        } else if (weth?.equals(inputCurrency) && outputCurrency.isNative) {
            return {
                wrapType: WrapType.UNWRAP,
                execute:
                    sufficientBalance && inputAmount
                        ? () =>
                              unwrap({
                                  address: WNATIVE[chainId].address as Address,
                                  args: [BigInt(inputAmount.quotient.toString())] as const,
                              })
                        : undefined,
                loading: isUnwrapLoading,
                inputError: sufficientBalance
                    ? undefined
                    : hasInputAmount
                    ? `Insufficient W${DEFAULT_NATIVE_SYMBOL} balance`
                    : `Enter W${DEFAULT_NATIVE_SYMBOL} amount`,
            };
        }

        if (wa7A5WrapDirection === Wa7A5WrapDirection.A7A5_TO_WA7A5) {
            const inputSymbol = inputCurrency.symbol;

            return {
                wrapType: WrapType.WRAP,
                approvalRequired: needsWa7A5Approval,
                approve: approveWa7A5,
                approvalLoading: isWa7A5ApprovalLoading,
                approvalTokenSymbol: inputSymbol,
                approvalState: wa7A5ApprovalState,
                execute:
                    sufficientBalance && inputAmount && !needsWa7A5Approval && !isWa7A5ApprovalLoading
                        ? () =>
                              wa7A5Wrap({
                                  args: [BigInt(inputAmount.quotient.toString())] as const,
                              })
                        : undefined,
                loading: isWa7A5WrapLoading,
                inputError: sufficientBalance
                    ? undefined
                    : hasInputAmount
                    ? `Insufficient ${inputSymbol} balance`
                    : `Enter ${inputSymbol} amount`,
            };
        }

        if (wa7A5WrapDirection === Wa7A5WrapDirection.WA7A5_TO_A7A5) {
            const inputSymbol = inputCurrency.symbol;

            return {
                wrapType: WrapType.UNWRAP,
                approvalRequired: needsWa7A5Approval,
                approve: approveWa7A5,
                approvalLoading: isWa7A5ApprovalLoading,
                approvalTokenSymbol: inputSymbol,
                approvalState: wa7A5ApprovalState,
                execute:
                    sufficientBalance && inputAmount && !needsWa7A5Approval && !isWa7A5ApprovalLoading
                        ? () =>
                              wa7A5Unwrap({
                                  args: [BigInt(inputAmount.quotient.toString())] as const,
                              })
                        : undefined,
                loading: isWa7A5UnwrapLoading,
                inputError: sufficientBalance
                    ? undefined
                    : hasInputAmount
                    ? `Insufficient ${inputSymbol} balance`
                    : `Enter ${inputSymbol} amount`,
            };
        }

        return NOT_APPLICABLE;
    }, [
        chainId,
        inputCurrency,
        outputCurrency,
        inputAmount,
        balance,
        wa7A5WrapDirection,
        isWa7A5WrapOperation,
        wa7A5ApprovalState,
        needsWa7A5Approval,
        isWa7A5ApprovalLoading,
        approveWa7A5,
        isWrapLoading,
        isUnwrapLoading,
        isWa7A5WrapLoading,
        isWa7A5UnwrapLoading,
        wrap,
        unwrap,
        wa7A5Wrap,
        wa7A5Unwrap,
    ]);
}
