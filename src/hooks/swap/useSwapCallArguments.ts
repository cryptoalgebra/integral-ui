import { Currency, Percent, Trade, TradeType, SwapRouter, } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { useAccount, useChainId } from "wagmi";

export function useSwapCallArguments(
    trade: Trade<Currency, Currency, TradeType> | undefined,
    allowedSlippage: Percent,
) {

    const { address: account } = useAccount()

    const chainId = useChainId()

    return useMemo(() => {

        if (!trade || !account || !chainId) return []

        const swapMethods: any[] = []

        const deadline = '300'

        swapMethods.push(
            SwapRouter.swapCallParameters(trade, {
                feeOnTransfer: false,
                recipient: account,
                slippageTolerance: allowedSlippage,
                deadline: Date.now() + deadline
            })
        )

        if (trade.tradeType === TradeType.EXACT_INPUT) {
            swapMethods.push(
                SwapRouter.swapCallParameters(trade, {
                    feeOnTransfer: true,
                    recipient: account,
                    slippageTolerance: allowedSlippage,
                    deadline: Date.now() + deadline
                })
            )
        }

        return swapMethods.map(({ calldata, value }) => {
            return {
                calldata,
                value,
            }
        })

    }, [])


}