import { useAlgebraPoolGlobalState, useAlgebraPoolTickSpacing } from "@/generated"
import { useCurrency } from "@/hooks/common/useCurrency"
import { useBestTradeExactIn, useBestTradeExactOut } from "@/hooks/swap/useBestTrade"
import useSwapSlippageTolerance from "@/hooks/swap/useSwapSlippageTolerance"
import { SwapField, SwapFieldType } from "@/types/swap-field"
import { TradeStateType } from "@/types/trade-state"
import { ADDRESS_ZERO, Currency, CurrencyAmount, Percent, TickMath, Trade, TradeType, computePoolAddress } from "@cryptoalgebra/integral-sdk"
import JSBI from "jsbi"
import { useCallback, useMemo } from "react"
import { parseUnits } from "viem"
import { Address, useAccount, useBalance } from "wagmi"
import { create } from "zustand"

interface SwapState {
    readonly independentField: SwapFieldType
    readonly typedValue: string
    readonly [SwapField.INPUT]: {
        readonly currencyId: Address | undefined
    }
    readonly [SwapField.OUTPUT]: {
        readonly currencyId: Address | undefined
    }
    readonly wasInverted: boolean;
    readonly lastFocusedField: SwapFieldType
    actions: {
        selectCurrency: (field: SwapFieldType, currencyId: string | undefined) => void,
        switchCurrencies: () => void,
        typeInput: (field: SwapFieldType, typedValue: string) => void,
    }
}


export const useSwapState = create<SwapState>((set, get) => ({
    independentField: SwapField.INPUT,
    typedValue: '',
    [SwapField.INPUT]: {
        currencyId: ADDRESS_ZERO
    },
    [SwapField.OUTPUT]: {
        currencyId: '0xbb354e3cdaef44d983d7183b4dea841abba21dc2'
    },
    wasInverted: false,
    lastFocusedField: SwapField.INPUT,
    actions: {
        selectCurrency: (field, currencyId) => {

            const otherField = field === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT

            if (currencyId === get()[otherField].currencyId) {
                set({
                    independentField: get().independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT,
                    lastFocusedField: get().independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT,
                    [field]: { currencyId },
                    [otherField]: { currencyId: get()[field].currencyId }
                })
            } else {
                set({
                    [field]: { currencyId }
                })
            }
        },
        switchCurrencies: () => set({
            independentField: get().independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT,
            lastFocusedField: get().independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT,
            [SwapField.INPUT]: { currencyId: get()[SwapField.OUTPUT].currencyId },
            [SwapField.OUTPUT]: { currencyId: get()[SwapField.INPUT].currencyId }
        }),
        typeInput: (field, typedValue) => set({
            independentField: field,
            lastFocusedField: field,
            typedValue
        }),
    }
}))


export function useSwapActionHandlers(): {
    onCurrencySelection: (field: SwapFieldType, currency: Currency) => void
    onSwitchTokens: () => void
    onUserInput: (field: SwapFieldType, typedValue: string) => void
} {

    const { actions: { selectCurrency, switchCurrencies, typeInput } } = useSwapState()

    const onCurrencySelection = useCallback(
        (field: SwapFieldType, currency: Currency) => selectCurrency(field, currency.isToken ? currency.address : currency.isNative ? ADDRESS_ZERO : '')
        , [])

    const onSwitchTokens = useCallback(() => {
        switchCurrencies()
    }, [])

    const onUserInput = useCallback(
        (field: SwapFieldType, typedValue: string) => {
            typeInput(field, typedValue)
        }, [])

    return {
        onSwitchTokens,
        onCurrencySelection,
        onUserInput,
    }
}

export function tryParseAmount<T extends Currency>(value?: string, currency?: T): CurrencyAmount<T> | undefined {
    if (!value || !currency) {
        return undefined
    }
    try {
        const typedValueParsed = parseUnits(value, currency.decimals).toString()
        if (typedValueParsed !== '0') {
            return CurrencyAmount.fromRawAmount(currency, typedValueParsed)
        }
    } catch (error) {
        console.debug(`Failed to parse input amount: "${value}"`, error)
    }
    return undefined
}

export function useDerivedSwapInfo(): {
    currencies: { [field in SwapFieldType]?: Currency }
    currencyBalances: { [field in SwapFieldType]?: CurrencyAmount<Currency> }
    parsedAmount: CurrencyAmount<Currency> | undefined
    inputError?: string
    tradeState: { trade: Trade<Currency, Currency, TradeType> | null; state: TradeStateType; fee?: bigint[] | null }
    toggledTrade: Trade<Currency, Currency, TradeType> | undefined
    tickAfterSwap: number | null | undefined
    allowedSlippage: Percent
    poolFee: number | undefined,
    tick: number | undefined,
    tickSpacing: number | undefined,
    poolAddress: Address | undefined
} {

    const { address: account } = useAccount()

    const {
        independentField,
        typedValue,
        [SwapField.INPUT]: { currencyId: inputCurrencyId },
        [SwapField.OUTPUT]: { currencyId: outputCurrencyId },
    } = useSwapState()

    const inputCurrency = useCurrency(inputCurrencyId);
    const outputCurrency = useCurrency(outputCurrencyId);

    const isExactIn: boolean = independentField === SwapField.INPUT
    const parsedAmount = useMemo(() => tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined), [typedValue, isExactIn, inputCurrency, outputCurrency])

    const bestTradeExactIn = useBestTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)
    const bestTradeExactOut = useBestTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined)

    const trade = (isExactIn ? bestTradeExactIn : bestTradeExactOut) ?? undefined

    const [addressA, addressB] = [
        (inputCurrency?.isNative ? undefined : inputCurrency?.address || ''),
        (outputCurrency?.isNative ? undefined : outputCurrency?.address || '')
    ] as Address[]

    const { data: inputCurrencyBalance } = useBalance({ address: account, token: addressA, watch: true });
    const { data: outputCurrencyBalance } = useBalance({ address: account, token: addressB, watch: true });

    const currencyBalances = {
        [SwapField.INPUT]: inputCurrency && inputCurrencyBalance && CurrencyAmount.fromRawAmount(inputCurrency, inputCurrencyBalance.value.toString()),
        [SwapField.OUTPUT]: outputCurrency && outputCurrencyBalance && CurrencyAmount.fromRawAmount(outputCurrency, outputCurrencyBalance.value.toString()),
    }

    const currencies: { [field in SwapFieldType]?: Currency } = {
        [SwapField.INPUT]: inputCurrency ?? undefined,
        [SwapField.OUTPUT]: outputCurrency ?? undefined
    }

    let inputError: string | undefined
    if (!account) {
        inputError = `Connect Wallet`
    }

    if (!parsedAmount) {
        inputError = inputError ?? `Enter an amount`
    }

    if (!currencies[SwapField.INPUT] || !currencies[SwapField.OUTPUT]) {
        inputError = inputError ?? `Select a token`
    }

    const toggledTrade = trade.trade ?? undefined

    const tickAfterSwap = trade.priceAfterSwap && TickMath.getTickAtSqrtRatio(JSBI.BigInt(trade.priceAfterSwap))

    const allowedSlippage = useSwapSlippageTolerance(toggledTrade)

    const [balanceIn, amountIn] = [currencyBalances[SwapField.INPUT], toggledTrade?.maximumAmountIn(allowedSlippage)]

    if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
        inputError = `Insufficient ${amountIn.currency.symbol} balance`
    }

    const poolAddress = currencies[SwapField.INPUT] && currencies[SwapField.OUTPUT] && computePoolAddress({
        tokenA: currencies[SwapField.INPUT]!.wrapped,
        tokenB: currencies[SwapField.OUTPUT]!.wrapped
    }).toLowerCase() as Address

    const { data: globalState } = useAlgebraPoolGlobalState({
        address: poolAddress
    })

    const { data: tickSpacing } = useAlgebraPoolTickSpacing({
        address: poolAddress
    })

    return {
        currencies,
        currencyBalances,
        parsedAmount,
        inputError,
        tradeState: trade,
        toggledTrade,
        tickAfterSwap,
        allowedSlippage,
        poolFee: globalState && globalState[2],
        tick: globalState && globalState[1],
        tickSpacing: tickSpacing,
        poolAddress
    }
}