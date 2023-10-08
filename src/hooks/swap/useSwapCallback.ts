import { Currency, Percent, Trade, TradeType } from "@cryptoalgebra/integral-sdk";
import { useAccount, useContractWrite } from "wagmi";
import { useSwapCallArguments } from "./useSwapCallArguments";
import { getAlgebraRouter, usePrepareAlgebraRouterMulticall } from "@/generated";
import { useEffect, useMemo, useState } from "react";
import { SwapCallbackState } from "@/types/swap-state";

interface SwapCallEstimate {
    calldata: string
    value: string
}

interface SuccessfulCall extends SwapCallEstimate {
    calldata: string
    value: string
    gasEstimate: bigint
}

interface FailedCall extends SwapCallEstimate {
    calldata: string
    value: string
    error: Error
}

export function useSwapCallback(
    trade: Trade<Currency, Currency, TradeType> | undefined,
    allowedSlippage: Percent,
) {

    const { address: account } = useAccount()

    const [bestCall, setBestCall] = useState<any>()

    const swapCalldata = useSwapCallArguments(trade, allowedSlippage)

    console.log('swapCalldata', swapCalldata)

    useEffect(() => {

        async function findBestCall() {

            if (!swapCalldata || !account) return

            const algebraRouter = getAlgebraRouter({})

            const calls = await Promise.all(swapCalldata.map(({ calldata, value }) => {

                return algebraRouter.estimateGas.multicall([
                    calldata
                ], {
                    account,
                    value
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
                    }).then(res => ({
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

            console.log('callsqqq', calls)

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

    }, [swapCalldata])


    console.log('BEST CALL', bestCall)

    const { config: swapConfig } = usePrepareAlgebraRouterMulticall({
        args: bestCall && [bestCall.calldata],
        value: BigInt(bestCall?.value || 0),
    })

    const { data: swapData, writeAsync: swapCallback } = useContractWrite(swapConfig)


    return useMemo(() => {

        if (!trade) return {
            state: SwapCallbackState.INVALID,
            callback: null,
            error: "No trade was found"
        }

        return {
            state: SwapCallbackState.VALID,
            callback: swapCallback,
            error: null
        }

    }, [trade, swapCalldata])

}