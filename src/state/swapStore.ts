import { DEFAULT_CHAIN_ID, enabledModules, TOKENS } from "config";
import { useReadAlgebraPoolGlobalState, useReadAlgebraPoolTickSpacing } from "@/generated";
import { useCurrency } from "@/hooks/common/useCurrency";
import { BestTradeExactIn, BestTradeExactOut, useBestTradeExactIn, useBestTradeExactOut } from "@/hooks/swap/useBestTrade";
import useSwapSlippageTolerance from "@/hooks/swap/useSwapSlippageTolerance";
import { SwapField, SwapFieldType } from "@/types/swap-field";
import {
    ADDRESS_ZERO,
    Currency,
    CurrencyAmount,
    Percent,
    Trade,
    TradeType,
    computePoolAddress,
    tryParseAmount,
} from "@cryptoalgebra/custom-pools-sdk";
import { useCallback, useMemo } from "react";
import { Address } from "viem";
import { useAccount, useBalance } from "wagmi";
import { create } from "zustand";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";

import SmartRouterModule from "@/modules/SmartRouterModule";
import { SmartRouter, SmartRouterTrade } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { SmartRouterBestTrade } from "@/modules/SmartRouterModule/types";
const { useSmartRouterBestTrade } = SmartRouterModule.hooks;

export enum RouterType {
    OMEGA = "OMEGA",
    NATIVE = "NATIVE",
}

interface SwapState {
    readonly independentField: SwapFieldType;
    readonly typedValue: string;
    readonly routerType: RouterType;
    readonly [SwapField.INPUT]: {
        readonly currencyId: Address | undefined;
    };
    readonly [SwapField.OUTPUT]: {
        readonly currencyId: Address | undefined;
    };
    readonly [SwapField.LIMIT_ORDER_PRICE]: string | null;
    readonly wasInverted: boolean;
    readonly limitOrderPriceFocused: boolean;
    readonly lastFocusedField: SwapFieldType;
    actions: {
        selectCurrency: (field: SwapFieldType, currencyId: string | undefined) => void;
        switchCurrencies: () => void;
        typeInput: (field: SwapFieldType, typedValue: string) => void;
        typeLimitOrderPrice: (limitOrderPrice: string) => void;
        limitOrderPriceWasInverted: (wasInverted: boolean) => void;
        limitOrderPriceFocused: (isFocused: boolean) => void;
        limitOrderPriceLastFocused: () => void;
        setRouterType: (routerType: RouterType) => void;
    };
}

export interface IDerivedSwapInfo {
    currencies: { [field in SwapFieldType]?: Currency };
    currencyBalances: { [field in SwapFieldType]?: CurrencyAmount<Currency> };
    parsedAmount: CurrencyAmount<Currency> | undefined;
    inputError?: string;
    tradeState: SmartRouterBestTrade | BestTradeExactIn | BestTradeExactOut;
    toggledTrade: Trade<Currency, Currency, TradeType> | SmartRouterTrade<TradeType> | null | undefined;
    smartTradeCallOptions: { calldata: Address | undefined; value: Address | undefined };
    allowedSlippage: Percent;
    poolFee: number | undefined;
    tick: number | undefined;
    tickSpacing: number | undefined;
    poolAddress: Address | undefined;
    parsedAmounts: { [field in SwapFieldType]?: CurrencyAmount<Currency> };
    isExactIn: boolean;
    refetchBalances: () => void;
    /** Step amounts out - output amount for each step (for Boosted ExactOutput) */
    stepAmountsOut?: string[] | null;
    priceImpact?: Percent | null;
}

export const useSwapState = create<SwapState>((set, get) => ({
    independentField: SwapField.INPUT,
    typedValue: "",
    routerType: enabledModules.BoostedPoolsModule ? RouterType.OMEGA : RouterType.NATIVE,
    [SwapField.INPUT]: {
        currencyId: ADDRESS_ZERO,
    },
    [SwapField.OUTPUT]: {
        currencyId: TOKENS[DEFAULT_CHAIN_ID].USDC.address as Address,
    },
    [SwapField.LIMIT_ORDER_PRICE]: "",
    wasInverted: false,
    limitOrderPriceFocused: false,
    lastFocusedField: SwapField.INPUT,
    actions: {
        selectCurrency: (field, currencyId) => {
            if (field === SwapField.LIMIT_ORDER_PRICE) return;

            const otherField = field === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT;

            if (currencyId && currencyId === get()[otherField].currencyId) {
                set({
                    independentField: get().independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT,
                    lastFocusedField: get().independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT,
                    [field]: { currencyId },
                    [otherField]: { currencyId: get()[field].currencyId },
                });
            } else {
                set({
                    [field]: { currencyId },
                });
            }
        },
        switchCurrencies: () =>
            set({
                independentField: get().independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT,
                lastFocusedField: get().independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT,
                [SwapField.INPUT]: { currencyId: get()[SwapField.OUTPUT].currencyId },
                [SwapField.OUTPUT]: { currencyId: get()[SwapField.INPUT].currencyId },
            }),
        typeInput: (field, typedValue) =>
            set({
                independentField: field,
                lastFocusedField: field,
                typedValue,
            }),
        typeLimitOrderPrice: (limitOrderPrice) =>
            set({
                [SwapField.LIMIT_ORDER_PRICE]: limitOrderPrice,
                lastFocusedField: SwapField.LIMIT_ORDER_PRICE,
            }),
        limitOrderPriceWasInverted: (wasInverted) =>
            set({
                wasInverted,
            }),
        limitOrderPriceFocused: (isFocused) =>
            set({
                limitOrderPriceFocused: isFocused,
                lastFocusedField: SwapField.LIMIT_ORDER_PRICE,
            }),
        limitOrderPriceLastFocused: () =>
            set({
                lastFocusedField: SwapField.LIMIT_ORDER_PRICE,
            }),
        setRouterType: (routerType) =>
            set({
                routerType,
            }),
    },
}));

export function useSwapActionHandlers(): {
    onCurrencySelection: (field: SwapFieldType, currency: Currency) => void;
    onSwitchTokens: () => void;
    onUserInput: (field: SwapFieldType, typedValue: string) => void;
} {
    const {
        actions: { selectCurrency, switchCurrencies, typeInput },
    } = useSwapState();

    const onCurrencySelection = useCallback(
        (field: SwapFieldType, currency: Currency) =>
            selectCurrency(field, currency.isToken ? currency.address : currency.isNative ? ADDRESS_ZERO : ""),
        []
    );

    const onSwitchTokens = useCallback(() => {
        switchCurrencies();
    }, []);

    const onUserInput = useCallback((field: SwapFieldType, typedValue: string) => {
        typeInput(field, typedValue);
    }, []);

    return {
        onSwitchTokens,
        onCurrencySelection,
        onUserInput,
    };
}

export function useDerivedSwapInfo(): IDerivedSwapInfo {
    const { address: account } = useAccount();

    const {
        independentField,
        typedValue,
        [SwapField.INPUT]: { currencyId: inputCurrencyId },
        [SwapField.OUTPUT]: { currencyId: outputCurrencyId },
        [SwapField.LIMIT_ORDER_PRICE]: limitOrderPrice,
        limitOrderPriceFocused,
        lastFocusedField,
        wasInverted,
    } = useSwapState();

    const inputCurrency = useCurrency(inputCurrencyId, inputCurrencyId === ADDRESS_ZERO);
    const outputCurrency = useCurrency(outputCurrencyId, outputCurrencyId === ADDRESS_ZERO);

    const isExactIn: boolean = independentField === SwapField.INPUT;

    const parsedAmount = useMemo(() => tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined), [
        typedValue,
        isExactIn,
        inputCurrency,
        outputCurrency,
    ]);
    const bestTradeExactIn = useBestTradeExactIn(
        isExactIn && !enabledModules.SmartRouterModule ? parsedAmount : undefined,
        outputCurrency ?? undefined
    );
    const bestTradeExactOut = useBestTradeExactOut(
        inputCurrency ?? undefined,
        !isExactIn && !enabledModules.SmartRouterModule ? parsedAmount : undefined
    );

    /* Smart Router trade */
    const smartTrade = useSmartRouterBestTrade(
        parsedAmount,
        isExactIn ? outputCurrency : inputCurrency,
        isExactIn,
        enabledModules.SmartRouterModule
    );

    const trade = enabledModules.SmartRouterModule ? smartTrade : (isExactIn ? bestTradeExactIn : bestTradeExactOut) ?? undefined;

    const [addressA, addressB] = [
        inputCurrency?.isNative ? undefined : inputCurrency?.address || "",
        outputCurrency?.isNative ? undefined : outputCurrency?.address || "",
    ] as Address[];

    const { data: inputCurrencyBalance, refetch: refetchInputBalance } = useBalance({
        address: account,
        token: addressA,
    });
    const { data: outputCurrencyBalance, refetch: refetchOutputBalance } = useBalance({
        address: account,
        token: addressB,
    });

    const currencyBalances = {
        [SwapField.INPUT]:
            inputCurrency && inputCurrencyBalance && CurrencyAmount.fromRawAmount(inputCurrency, inputCurrencyBalance.value.toString()),
        [SwapField.OUTPUT]:
            outputCurrency && outputCurrencyBalance && CurrencyAmount.fromRawAmount(outputCurrency, outputCurrencyBalance.value.toString()),
    };

    const refetchBalances = useCallback(() => {
        refetchInputBalance();
        refetchOutputBalance();
    }, [refetchInputBalance, refetchOutputBalance]);

    const currencies: { [field in SwapFieldType]?: Currency } = {
        [SwapField.INPUT]: inputCurrency ?? undefined,
        [SwapField.OUTPUT]: outputCurrency ?? undefined,
    };

    let inputError: string | undefined;
    if (!account) {
        inputError = `Connect Wallet`;
    }

    if (!parsedAmount) {
        inputError = inputError ?? `Enter an amount`;
    }

    if (!currencies[SwapField.INPUT] || !currencies[SwapField.OUTPUT]) {
        inputError = inputError ?? `Select a token`;
    }

    const toggledTrade = trade.trade && "bestTrade" in trade.trade ? trade.trade?.bestTrade : trade.trade;
    const isSmartTrade = toggledTrade && "routes" in toggledTrade;

    const smartTradeCallOptions = {
        calldata: trade.trade && "bestTrade" in trade.trade ? trade.trade?.calldata : undefined,
        value: trade.trade && "bestTrade" in trade.trade ? trade.trade?.value : undefined,
    };

    const allowedSlippage = useSwapSlippageTolerance(toggledTrade);

    const maximumAmountIn = isSmartTrade
        ? SmartRouter.maximumAmountIn(toggledTrade, allowedSlippage)
        : toggledTrade?.maximumAmountIn(allowedSlippage);

    const [balanceIn, amountIn] = [currencyBalances[SwapField.INPUT], maximumAmountIn];

    if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
        inputError = `Insufficient ${amountIn.currency.symbol} balance`;
    }

    const isWrap = currencies.INPUT && currencies.OUTPUT && currencies.INPUT.wrapped.equals(currencies.OUTPUT.wrapped);

    const poolAddress = isWrap
        ? undefined
        : currencies[SwapField.INPUT] &&
          currencies[SwapField.OUTPUT] &&
          (computePoolAddress({
              tokenA: currencies[SwapField.INPUT]!.wrapped,
              tokenB: currencies[SwapField.OUTPUT]!.wrapped,
          }).toLowerCase() as Address);

    const { data: globalState } = useReadAlgebraPoolGlobalState({
        address: poolAddress,
    });

    const { data: tickSpacing } = useReadAlgebraPoolTickSpacing({
        address: poolAddress,
    });

    const { wrapType } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;

    const { parsedLimitOrderInput, parsedLimitOrderOutput } = useMemo(() => {
        if (!limitOrderPrice || !parsedAmount || !outputCurrency || !inputCurrency) return {};

        try {
            const parsedAmountNumber = parseFloat(parsedAmount.toExact());
            const limitPriceNumber = parseFloat(limitOrderPrice);

            if (independentField === SwapField.INPUT) {
                const outputAmount = !wasInverted ? parsedAmountNumber * limitPriceNumber : parsedAmountNumber / limitPriceNumber;
                return {
                    parsedLimitOrderInput: parsedAmount,
                    parsedLimitOrderOutput: tryParseAmount(outputAmount.toFixed(outputCurrency.decimals), outputCurrency),
                };
            } else {
                const inputAmount = !wasInverted ? parsedAmountNumber / limitPriceNumber : parsedAmountNumber * limitPriceNumber;

                return {
                    parsedLimitOrderInput: tryParseAmount(inputAmount.toFixed(inputCurrency.decimals), inputCurrency),
                    parsedLimitOrderOutput: parsedAmount,
                };
            }
        } catch (error) {
            console.error("Error calculating limit order amounts:", error);
            return {};
        }
    }, [limitOrderPrice, parsedAmount, outputCurrency, inputCurrency, independentField, wasInverted]);

    const parsedAmounts = useMemo(() => {
        return showWrap
            ? {
                  [SwapField.INPUT]: parsedAmount,
                  [SwapField.OUTPUT]: parsedAmount,
              }
            : {
                  [SwapField.INPUT]:
                      independentField === SwapField.INPUT
                          ? parsedAmount
                          : limitOrderPrice
                          ? parsedLimitOrderInput
                          : toggledTrade?.inputAmount,
                  [SwapField.OUTPUT]:
                      independentField === SwapField.OUTPUT
                          ? limitOrderPrice
                              ? outputCurrency && parsedAmount
                                  ? !limitOrderPriceFocused && lastFocusedField === SwapField.LIMIT_ORDER_PRICE
                                      ? parsedLimitOrderOutput
                                      : parsedAmount
                                  : undefined
                              : parsedAmount
                          : limitOrderPrice
                          ? outputCurrency && parsedAmount
                              ? parsedLimitOrderOutput
                              : undefined
                          : toggledTrade?.outputAmount,
              };
    }, [
        showWrap,
        independentField,
        parsedAmount,
        limitOrderPrice,
        parsedLimitOrderInput,
        parsedLimitOrderOutput,
        toggledTrade,
        outputCurrency,
        limitOrderPriceFocused,
        lastFocusedField,
    ]);

    // Extract stepAmounts from trade state (only for non-SmartRouter trades)
    const stepAmountsOut = "stepAmountsOut" in trade ? trade.stepAmountsOut : null;

    // Extract priceImpact from trade state (only for non-SmartRouter trades)
    const priceImpact = "priceImpact" in trade ? trade.priceImpact : null;

    return {
        currencies,
        currencyBalances,
        parsedAmount,
        inputError,
        tradeState: trade,
        toggledTrade,
        smartTradeCallOptions,
        allowedSlippage,
        poolFee: globalState && globalState[2],
        tick: globalState && globalState[1],
        tickSpacing: tickSpacing,
        poolAddress,
        isExactIn,
        parsedAmounts,
        refetchBalances,
        stepAmountsOut,
        priceImpact,
    };
}
