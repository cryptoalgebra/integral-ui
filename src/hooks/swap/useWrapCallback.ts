import { WNATIVE_EXTENDED } from "@/constants/routing";
import { usePrepareWrappedNativeDeposit, usePrepareWrappedNativeWithdraw } from "@/generated";
import { Currency, WNATIVE, tryParseAmount } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { Address, useAccount, useBalance, useChainId, useContractWrite } from "wagmi";
import { useTransactionAwait } from "../common/useTransactionAwait";
import { DEFAULT_NATIVE_SYMBOL } from "@/constants/default-chain-id";
import { TransactionType } from "@/state/pendingTransactionsStore";

export const WrapType = {
    NOT_APPLICABLE: 'NOT_APPLICABLE',
    WRAP: 'WRAP',
    UNWRAP: 'UNWRAP',
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }

export default function useWrapCallback(
    inputCurrency: Currency | undefined,
    outputCurrency: Currency | undefined,
    typedValue: string | undefined
): { wrapType: typeof WrapType[keyof typeof WrapType]; execute?: undefined | (() => void); loading?: boolean; inputError?: string, isPending?: boolean } {
    
    const chainId = useChainId()
    const { address: account } = useAccount()

    const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue])

    const { config: wrapConfig } = usePrepareWrappedNativeDeposit({
        address: WNATIVE[chainId].address as Address,
        value: inputAmount ? BigInt(inputAmount.quotient.toString()) : undefined
    })

    const { data: wrapData, write: wrap } = useContractWrite(wrapConfig)

    const { isLoading: isWrapLoading } = useTransactionAwait(
        wrapData?.hash,
        { 
            title: `Wrap ${inputAmount?.toSignificant(3)} ${DEFAULT_NATIVE_SYMBOL}`,
            tokenA: WNATIVE[chainId].address as Address,
            type: TransactionType.SWAP
        }
    )

    const { config: unwrapConfig } = usePrepareWrappedNativeWithdraw({
        address: WNATIVE[chainId].address as Address,
        args: inputAmount ? [BigInt(inputAmount.quotient.toString())] : undefined
    })

    const { data: unwrapData, write: unwrap, isLoading: isPending } = useContractWrite(unwrapConfig)

    const { isLoading: isUnwrapLoading } = useTransactionAwait(
        unwrapData?.hash,
        { 
            title: `Unwrap ${inputAmount?.toSignificant(3)} W${DEFAULT_NATIVE_SYMBOL}`,
            tokenA: WNATIVE[chainId].address as Address,
            type: TransactionType.SWAP,
        }
    )   

    const { data: balance } = useBalance({
        enabled: Boolean(inputCurrency),
        address: account,
        token: inputCurrency?.isNative ? undefined : inputCurrency?.address as Address
    })

    return useMemo(() => {
        if (!chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE
        const weth = WNATIVE_EXTENDED[chainId]
        if (!weth) return NOT_APPLICABLE

        const hasInputAmount = Boolean(inputAmount?.greaterThan('0'))
        const sufficientBalance = inputAmount && balance && Number(balance.formatted) >= Number(inputAmount.toSignificant(18))

        if (inputCurrency.isNative && weth.equals(outputCurrency)) {
            return {
                wrapType: WrapType.WRAP,
                execute: sufficientBalance && inputAmount ? wrap : undefined,
                loading: isWrapLoading,
                inputError: sufficientBalance ? undefined : hasInputAmount ? `Insufficient ${DEFAULT_NATIVE_SYMBOL} balance` : `Enter ${DEFAULT_NATIVE_SYMBOL} amount`,
                isPending,
            }
        } else if (weth.equals(inputCurrency) && outputCurrency.isNative) {
            return {
                wrapType: WrapType.UNWRAP,
                execute: sufficientBalance && inputAmount ? unwrap : undefined,
                loading: isUnwrapLoading,
                inputError: sufficientBalance ? undefined : hasInputAmount ? `Insufficient W${DEFAULT_NATIVE_SYMBOL} balance` : `Enter W${DEFAULT_NATIVE_SYMBOL} amount`,
                isPending,
            }
        } else {
            return NOT_APPLICABLE
        }
    }, [chainId, inputCurrency, outputCurrency, inputAmount, balance, isWrapLoading, isUnwrapLoading, wrap, unwrap, isPending])
}