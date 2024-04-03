import { Currency, Percent, Trade, TradeType } from "@cryptoalgebra/integral-sdk";
import { useAccount, useContractWrite } from "wagmi";
import { useSwapCallArguments } from "./useSwapCallArguments";
import { getAlgebraRouter, usePrepareAlgebraRouterMulticall } from "@/generated";
import { useEffect, useMemo, useState } from "react";
import { SwapCallbackState } from "@/types/swap-state";
import { useTransitionAwait } from "../common/useTransactionAwait";
import { formatCurrency } from "@/utils/common/formatCurrency";
import { ApprovalStateType } from "@/types/approve-state";

interface SwapCallEstimate {
    calldata: string
    value: bigint
}

interface SuccessfulCall extends SwapCallEstimate {
    calldata: string
    value: bigint
    gasEstimate: bigint
}

interface FailedCall extends SwapCallEstimate {
    calldata: string
    value: bigint
    error: Error
}

export function useSwapCallback(
    trade: Trade<Currency, Currency, TradeType> | undefined,
    allowedSlippage: Percent,
    approvalState: ApprovalStateType
) {

    const { address: account } = useAccount()

    const [bestCall, setBestCall] = useState<any>()

    const swapCalldata = useSwapCallArguments(trade, allowedSlippage)

    useEffect(() => {

        async function findBestCall() {

            if (!swapCalldata || !account) return

            setBestCall(undefined)

            const algebraRouter = getAlgebraRouter({})

            const calls = await Promise.all(swapCalldata.map(({ calldata, value: _value }) => {

                const value = BigInt(_value)

                return algebraRouter.estimateGas.multicall([
                    calldata
                ], {
                    account,
                    value,
                }).then(gasEstimate => ({
                    calldata,
                    value,
                    gasEstimate
                })).catch(gasError => {

                    return algebraRouter.simulate.multicall([
                        calldata
                    ], {
                        account,
                        value
                    }).then(() => ({
                        calldata,
                        value,
                        error: new Error(`Unexpected issue with estimating the gas. Please try again. ${gasError}`)
                    })).catch(callError => ({
                        calldata,
                        value,
                        error: new Error(callError)
                    }))

                })

            }))

            let bestCallOption: SuccessfulCall | SwapCallEstimate | undefined = calls.find(
                (el, ix, list): el is SuccessfulCall =>
                    'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1])
            )

            if (!bestCallOption) {
                const errorCalls = calls.filter((call): call is FailedCall => 'error' in call)
                if (errorCalls.length > 0) throw errorCalls[errorCalls.length - 1].error
                const firstNoErrorCall = calls.find<any>(
                    (call): call is any => !('error' in call)
                )
                if (!firstNoErrorCall) throw new Error('Unexpected error. Could not estimate gas for the swap.')
                bestCallOption = firstNoErrorCall
            }

            setBestCall(bestCallOption)

        }

        swapCalldata && findBestCall()

    }, [swapCalldata, approvalState, account])


    const { config: swapConfig } = usePrepareAlgebraRouterMulticall({
        args: bestCall && [bestCall.calldata],
        value: BigInt(bestCall?.value || 0),
        enabled: Boolean(bestCall)
    })

    const { data: swapData, writeAsync: swapCallback } = useContractWrite(swapConfig)

    const { isLoading, isSuccess } = useTransitionAwait(swapData?.hash, `Swap ${formatCurrency.format(Number(trade?.inputAmount.toSignificant()))} ${trade?.inputAmount.currency.symbol} `)

    return useMemo(() => {

        if (!trade) return {
            state: SwapCallbackState.INVALID,
            callback: null,
            error: "No trade was found",
            isLoading: false,
            isSuccess: false
        }

        return {
            state: SwapCallbackState.VALID,
            callback: swapCallback,
            error: null,
            isLoading,
            isSuccess
        }

    }, [trade, isLoading, swapCalldata, swapCallback, swapConfig, isSuccess])

}