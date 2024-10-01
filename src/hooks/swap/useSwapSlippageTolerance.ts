import { useUserSlippageToleranceWithDefault } from "@/state/userStore"
import { Currency, Percent, Trade, TradeType } from "@cryptoalgebra/sdk"
import { useMemo } from "react"

const SWAP_DEFAULT_SLIPPAGE = new Percent(50, 10_000) // .50%
const ONE_TENTHS_PERCENT = new Percent(10, 10_000) // .10%

export default function useSwapSlippageTolerance(
    trade: Trade<Currency, Currency, TradeType> | undefined
): Percent {

    const defaultSlippageTolerance = useMemo(() => {
        if (!trade) return ONE_TENTHS_PERCENT
        return SWAP_DEFAULT_SLIPPAGE
    }, [trade])


    return useUserSlippageToleranceWithDefault(defaultSlippageTolerance)
}
