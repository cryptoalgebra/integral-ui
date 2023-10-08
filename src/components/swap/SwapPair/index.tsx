import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from "@/state/swapStore";
import { SwapField, SwapFieldType } from "@/types/swap-field";
import { Currency, CurrencyAmount, getTickToPrice, maxAmountSpend, tryParseAmount, Percent } from "@cryptoalgebra/integral-sdk";
import { useCallback, useMemo } from "react";
import TokenCard from "../TokenCard";

const SwapPair = () => {

    const { tradeState, toggledTrade: trade, allowedSlippage, currencyBalances, parsedAmount, currencies, inputError: swapInputError, poolFee } = useDerivedSwapInfo();

    const { tick } = useDerivedSwapInfo();

    const baseCurrency = currencies[SwapField.INPUT];
    const quoteCurrency = currencies[SwapField.OUTPUT];

    const pairPrice = getTickToPrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, tick);

    const { independentField, typedValue, [SwapField.LIMIT_ORDER_PRICE]: limitOrderPrice, wasInverted, limitOrderPriceFocused, lastFocusedField } = useSwapState();
    const dependentField: SwapFieldType = independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT;

    const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers();

    // const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

    const handleInputSelect = useCallback(
        (inputCurrency: Currency) => {
            // setApprovalSubmitted(false); // reset 2 step UI for approvals
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

        const independentPrice = independentField === SwapField.OUTPUT ? parsedAmount.divide(pairPrice.asFraction).toSignificant(5) ?? 1 : +parsedAmount.toSignificant(5) ?? 1;

        if (wasInverted) return tryParseAmount(String((Number(independentPrice) / (+limitOrderPrice || 1)).toFixed(5)), quoteCurrency);

        return tryParseAmount(String((+limitOrderPrice * Number(independentPrice)).toFixed(5)), quoteCurrency);
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

    const fiatValueInput = useUSDCValue(tryParseAmount(parsedAmounts[SwapField.INPUT]?.toSignificant(18), baseCurrency));
    const fiatValueOutput = useUSDCValue(tryParseAmount(parsedAmounts[SwapField.OUTPUT]?.toSignificant(18), quoteCurrency));
    // const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput);
    const priceImpact = new Percent('1')

    const formattedAmounts = {
        [independentField]: independentField === SwapField.OUTPUT ? parsedAmounts[independentField]?.toSignificant(6) : typedValue,
        [dependentField]: showWrap && independentField !== SwapField.LIMIT_ORDER_PRICE ? parsedAmounts[independentField]?.toExact() ?? "" : parsedAmounts[dependentField]?.toSignificant(6) ?? "",
    };

    return <div className="flex flex-col">
        <TokenCard value={formattedAmounts[SwapField.INPUT] || ""}
            currency={baseCurrency}
            otherCurrency={quoteCurrency}
            handleTokenSelection={handleInputSelect}
            handleValueChange={handleTypeInput}
            handleMaxValue={handleMaxInput}
            fiatValue={fiatValueInput ?? undefined}
            showMaxButton={showMaxButton}
            priceImpact={priceImpact}
            field={SwapField.INPUT} />

        <button
            className="swap-pair__switch"
            onClick={() => {
                onSwitchTokens();
                // setTimeout(() => {
                //     if (independentField === Field.INPUT) {
                //         handleTypeInput(formattedAmounts[Field.INPUT]);
                //     } else {
                //         handleTypeInput(formattedAmounts[Field.OUTPUT]);
                //     }
                // }, 0);
            }}
        >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M4.57572 0.575644L0.757344 4.39402C0.523029 4.62834 0.523029 5.00823 0.757344 5.24255C0.991659 5.47686 1.37156 5.47686 1.60587 5.24255L4.84851 1.99991H5.15146L8.3941 5.24255C8.62841 5.47686 9.00831 5.47686 9.24263 5.24255C9.47694 5.00823 9.47694 4.62834 9.24263 4.39402L5.42425 0.575644C5.18993 0.34133 4.81004 0.34133 4.57572 0.575644ZM5.42425 15.4242L9.24263 11.6058C9.47694 11.3715 9.47694 10.9916 9.24263 10.7573C9.00831 10.523 8.62841 10.523 8.3941 10.7573L5.15146 13.9999H4.84851L1.60587 10.7573C1.37156 10.523 0.991659 10.523 0.757344 10.7573C0.523029 10.9916 0.523029 11.3715 0.757344 11.6058L4.57572 15.4242C4.81004 15.6585 5.18993 15.6585 5.42425 15.4242Z"
                    fill="black"
                />
            </svg>
        </button>
        <TokenCard
            value={formattedAmounts[SwapField.OUTPUT] || ""}
            currency={quoteCurrency}
            otherCurrency={baseCurrency}
            handleTokenSelection={handleOutputSelect}
            handleValueChange={handleTypeOutput}
            fiatValue={fiatValueOutput ?? undefined}
            priceImpact={priceImpact}
            field={SwapField.OUTPUT}
        />
    </div>

}

export default SwapPair;