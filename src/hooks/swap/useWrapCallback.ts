import { Currency, WNATIVE, tryParseAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { useAccount, useBalance, useChainId } from "wagmi";
import { useTransactionAwait } from "../common/useTransactionAwait";
import { DEFAULT_NATIVE_SYMBOL, WNATIVE_EXTENDED } from "config";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Address } from "viem";
import { useWriteWrappedNativeDeposit, useWriteWrappedNativeWithdraw } from "@/generated";

export const WrapType = {
    NOT_APPLICABLE: "NOT_APPLICABLE",
    WRAP: "WRAP",
    UNWRAP: "UNWRAP",
};

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE };

export default function useWrapCallback(
    inputCurrency: Currency | undefined,
    outputCurrency: Currency | undefined,
    typedValue: string | undefined,
    onTransactionSuccess?: () => void
): { wrapType: typeof WrapType[keyof typeof WrapType]; execute?: undefined | (() => void); loading?: boolean; inputError?: string } {
    const chainId = useChainId();
    const { address: account } = useAccount();

    const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue]);

    const wrapConfig = inputAmount
        ? {
              address: WNATIVE[chainId]?.address as Address,
              value: BigInt(inputAmount.quotient.toString()),
          }
        : undefined;

    const { data: wrapData, writeContract: wrap } = useWriteWrappedNativeDeposit();

    const { isLoading: isWrapLoading } = useTransactionAwait(wrapData, {
        title: `Wrap ${inputAmount?.toSignificant(3)} ${DEFAULT_NATIVE_SYMBOL}`,
        tokenA: WNATIVE[chainId].address as Address,
        type: TransactionType.SWAP,
        callback: onTransactionSuccess,
    });

    const unwrapConfig = inputAmount
        ? {
              address: WNATIVE[chainId].address as Address,
              args: [BigInt(inputAmount.quotient.toString())] as const,
          }
        : undefined;

    const { data: unwrapData, writeContract: unwrap } = useWriteWrappedNativeWithdraw();

    const { isLoading: isUnwrapLoading } = useTransactionAwait(unwrapData, {
        title: `Unwrap ${inputAmount?.toSignificant(3)} W${DEFAULT_NATIVE_SYMBOL}`,
        tokenA: WNATIVE[chainId].address as Address,
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
        if (!weth) return NOT_APPLICABLE;

        const hasInputAmount = Boolean(inputAmount?.greaterThan("0"));
        const sufficientBalance = inputAmount && balance && Number(balance.formatted) >= Number(inputAmount.toSignificant(18));

        if (inputCurrency.isNative && weth.equals(outputCurrency)) {
            return {
                wrapType: WrapType.WRAP,
                execute: sufficientBalance && inputAmount ? () => wrapConfig && wrap(wrapConfig) : undefined,
                loading: isWrapLoading,
                inputError: sufficientBalance
                    ? undefined
                    : hasInputAmount
                    ? `Insufficient ${DEFAULT_NATIVE_SYMBOL} balance`
                    : `Enter ${DEFAULT_NATIVE_SYMBOL} amount`,
            };
        } else if (weth.equals(inputCurrency) && outputCurrency.isNative) {
            return {
                wrapType: WrapType.UNWRAP,
                execute: sufficientBalance && inputAmount ? () => unwrapConfig && unwrap(unwrapConfig) : undefined,
                loading: isUnwrapLoading,
                inputError: sufficientBalance
                    ? undefined
                    : hasInputAmount
                    ? `Insufficient W${DEFAULT_NATIVE_SYMBOL} balance`
                    : `Enter W${DEFAULT_NATIVE_SYMBOL} amount`,
            };
        } else {
            return NOT_APPLICABLE;
        }
    }, [chainId, inputCurrency, outputCurrency, inputAmount, balance, isWrapLoading, isUnwrapLoading, wrap, unwrap]);
}
