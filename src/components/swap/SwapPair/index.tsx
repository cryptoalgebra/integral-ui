import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from "@/state/swapStore";
import { SwapField, SwapFieldType } from "@/types/swap-field";
import { Currency, CurrencyAmount, getTickToPrice, maxAmountSpend, tryParseAmount } from "@cryptoalgebra/integral-sdk";
import { useCallback, useMemo } from "react";
import TokenCard from "../TokenCard";
import { ChevronsUpDownIcon } from "lucide-react";
import { computeFiatValuePriceImpact } from "@/utils/swap/computePriceImpact";

const SwapPair = () => {

    const { toggledTrade: trade, currencyBalances, parsedAmount, currencies, tick } = useDerivedSwapInfo();

    const baseCurrency = currencies[SwapField.INPUT];
    const quoteCurrency = currencies[SwapField.OUTPUT];

    const pairPrice = getTickToPrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, tick);

    const { 
        independentField, 
        typedValue, 
        [SwapField.LIMIT_ORDER_PRICE]: limitOrderPrice, 
        wasInverted, 
        limitOrderPriceFocused, 
        lastFocusedField
    } = useSwapState();
    const dependentField: SwapFieldType = independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT;

    const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers();

    const handleInputSelect = useCallback(
        (inputCurrency: Currency) => {
            onCurrencySelection(SwapField.INPUT, inputCurrency);
        },
        [onCurrencySelection]
    );

    const handleOutputSelect = useCallback(
        (outputCurrency: Currency) => {
            onCurrencySelection(SwapField.OUTPUT, outputCurrency);
        },
        [onCurrencySelection]
    );

    const handleTypeInput = useCallback(
        (value: string) => {
            onUserInput(SwapField.INPUT, value);
        },
        [onUserInput]
    );
    const handleTypeOutput = useCallback(
        (value: string) => {
            onUserInput(SwapField.OUTPUT, value);
        },
        [onUserInput]
    );

    // const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);

    // const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
    const showWrap: boolean = false

    //TODO reuse this
    const parsedLimitOrderOutput = useMemo(() => {
        if (!limitOrderPrice || !parsedAmount || !quoteCurrency || !pairPrice) return;

        const independentPrice = independentField === SwapField.OUTPUT ? parsedAmount.divide(pairPrice.asFraction).toSignificant(parsedAmount.currency.decimals / 2) ?? 1 : +parsedAmount.toSignificant(parsedAmount.currency.decimals / 2) ?? 1;

        if (wasInverted) return tryParseAmount(String((Number(independentPrice) / (+limitOrderPrice || 1)).toFixed(quoteCurrency.decimals / 2)), quoteCurrency);

        return tryParseAmount(String((+limitOrderPrice * Number(independentPrice)).toFixed(quoteCurrency.decimals / 2)), quoteCurrency);
    }, [limitOrderPrice, wasInverted, parsedAmount, quoteCurrency, trade, pairPrice, independentField]);

    const parsedAmounts = useMemo(() => {
        return showWrap
            ? {
                [SwapField.INPUT]: parsedAmount,
                [SwapField.OUTPUT]: parsedAmount,
            }
            : {
                [SwapField.INPUT]: independentField === SwapField.INPUT ? parsedAmount : pairPrice && limitOrderPrice ? parsedAmount?.divide(pairPrice.asFraction) : trade?.inputAmount,
                [SwapField.OUTPUT]:
                    independentField === SwapField.OUTPUT
                        ? limitOrderPrice
                            ? quoteCurrency && parsedAmount
                                ? !limitOrderPriceFocused && lastFocusedField === SwapField.LIMIT_ORDER_PRICE
                                    ? parsedLimitOrderOutput
                                    : parsedAmount
                                : undefined
                            : parsedAmount
                        : limitOrderPrice
                            ? quoteCurrency && parsedAmount
                                ? parsedLimitOrderOutput
                                : undefined
                            : trade?.outputAmount,
            };
    }, [baseCurrency, independentField, parsedAmount, showWrap, trade, limitOrderPrice, quoteCurrency, pairPrice, limitOrderPriceFocused, lastFocusedField]);

    const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[SwapField.INPUT]);
    const showMaxButton = Boolean(maxInputAmount?.greaterThan(0) && !parsedAmounts[SwapField.INPUT]?.equalTo(maxInputAmount));

    const handleMaxInput = useCallback(() => {
        maxInputAmount && onUserInput(SwapField.INPUT, maxInputAmount.toExact());
    }, [maxInputAmount, onUserInput]);

    const { price: fiatValueInputPrice, formatted: fiatValueInputFormatted } = useUSDCValue(tryParseAmount(parsedAmounts[SwapField.INPUT]?.toSignificant((parsedAmounts[SwapField.INPUT]?.currency.decimals || 6) / 2), baseCurrency));
    const { price: fiatValueOutputPrice, formatted: fiatValueOutputFormatted } = useUSDCValue(tryParseAmount(parsedAmounts[SwapField.OUTPUT]?.toSignificant((parsedAmounts[SwapField.OUTPUT]?.currency.decimals || 6) / 2), quoteCurrency));
    
    const priceImpact = computeFiatValuePriceImpact(fiatValueInputPrice, fiatValueOutputPrice);

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: showWrap && independentField !== SwapField.LIMIT_ORDER_PRICE ? parsedAmounts[independentField]?.toExact() ?? "" : parsedAmounts[dependentField]?.toFixed((parsedAmounts[dependentField]?.currency.decimals || 6) / 2) ?? "",
    };

    return <div className="flex flex-col gap-1 relative">
        <TokenCard value={formattedAmounts[SwapField.INPUT] || ""}
            currency={baseCurrency}
            otherCurrency={quoteCurrency}
            handleTokenSelection={handleInputSelect}
            handleValueChange={handleTypeInput}
            handleMaxValue={handleMaxInput}
            fiatValue={fiatValueInputFormatted ?? undefined}
            showMaxButton={showMaxButton}
            priceImpact={priceImpact}
            field={SwapField.INPUT} />
        <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-card-dark w-fit rounded-full border-[5px] border-[#1a1d2b] hover:bg-card-hover duration-200" onClick={onSwitchTokens}>
            <ChevronsUpDownIcon size={16} />
        </button>
        <TokenCard
            value={formattedAmounts[SwapField.OUTPUT] || ""}
            currency={quoteCurrency}
            otherCurrency={baseCurrency}
            handleTokenSelection={handleOutputSelect}
            handleValueChange={handleTypeOutput}
            fiatValue={fiatValueOutputFormatted ?? undefined}
            priceImpact={priceImpact}
            field={SwapField.OUTPUT}
        />
    </div>

}

export default SwapPair;