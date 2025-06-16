import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { IDerivedSwapInfo, useSwapActionHandlers, useSwapState } from "@/state/swapStore";
import { SwapField, SwapFieldType } from "@/types/swap-field";
import {
    computeCustomPoolAddress,
    Currency,
    CurrencyAmount,
    getTickToPrice,
    maxAmountSpend,
    TradeType,
    tryParseAmount,
} from "@cryptoalgebra/custom-pools-sdk";
import { useCallback, useMemo } from "react";
import TokenCard from "../TokenCard";
import { ChevronsUpDownIcon } from "lucide-react";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import { SmartRouterTrade } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { CUSTOM_POOL_DEPLOYER_LIMIT_ORDER } from "@/constants/addresses";
import { usePool } from "@/hooks/pools/usePool";
import { Address } from "viem";
import { useChainId } from "wagmi";

const SwapPair = ({ derivedSwap, smartTrade }: { derivedSwap: IDerivedSwapInfo; smartTrade: SmartRouterTrade<TradeType> }) => {
    const chainId = useChainId();

    const {
        independentField,
        typedValue,
        [SwapField.LIMIT_ORDER_PRICE]: limitOrderPrice,
        limitOrderPriceFocused,
        lastFocusedField,
        wasInverted,
    } = useSwapState();

    const { currencyBalances, parsedAmount, currencies } = derivedSwap;

    const baseCurrency = currencies[SwapField.INPUT];
    const quoteCurrency = currencies[SwapField.OUTPUT];

    const { wrapType } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;

    const limitOrderPoolAddress =
        baseCurrency && quoteCurrency && CUSTOM_POOL_DEPLOYER_LIMIT_ORDER[chainId] && !showWrap
            ? (computeCustomPoolAddress({
                  tokenA: baseCurrency.wrapped,
                  tokenB: quoteCurrency.wrapped,
                  customPoolDeployer: CUSTOM_POOL_DEPLOYER_LIMIT_ORDER[chainId],
              }) as Address)
            : undefined;

    const [, limitOrderPool] = usePool(limitOrderPoolAddress);

    const pairPrice = getTickToPrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, limitOrderPool?.tickCurrent);

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

    const { parsedLimitOrderInput, parsedLimitOrderOutput } = useMemo(() => {
        if (!limitOrderPrice || !parsedAmount || !quoteCurrency || !baseCurrency) return {};

        try {
            const parsedAmountNumber = parseFloat(parsedAmount.toExact());
            const limitPriceNumber = parseFloat(limitOrderPrice);

            if (independentField === SwapField.INPUT) {
                const outputAmount = !wasInverted ? parsedAmountNumber * limitPriceNumber : parsedAmountNumber / limitPriceNumber;
                return {
                    parsedLimitOrderInput: parsedAmount,
                    parsedLimitOrderOutput: tryParseAmount(outputAmount.toFixed(quoteCurrency.decimals), quoteCurrency),
                };
            } else {
                const inputAmount = !wasInverted ? parsedAmountNumber / limitPriceNumber : parsedAmountNumber * limitPriceNumber;

                return {
                    parsedLimitOrderInput: tryParseAmount(inputAmount.toFixed(baseCurrency.decimals), baseCurrency),
                    parsedLimitOrderOutput: parsedAmount,
                };
            }
        } catch (error) {
            console.error("Error calculating limit order amounts:", error);
            return {};
        }
    }, [limitOrderPrice, parsedAmount, quoteCurrency, baseCurrency, independentField, wasInverted]);

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
                          : pairPrice && limitOrderPrice
                          ? parsedLimitOrderInput
                          : smartTrade?.inputAmount,
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
                          : smartTrade?.outputAmount,
              };
    }, [
        showWrap,
        independentField,
        parsedAmount,
        limitOrderPrice,
        parsedLimitOrderInput,
        parsedLimitOrderOutput,
        smartTrade,
        quoteCurrency,
        limitOrderPriceFocused,
        lastFocusedField,
    ]);

    const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[SwapField.INPUT]);
    const showMaxButton = Boolean(maxInputAmount?.greaterThan(0));

    const handleMaxInput = useCallback(() => {
        maxInputAmount && onUserInput(SwapField.INPUT, maxInputAmount.toExact());
    }, [maxInputAmount, onUserInput]);

    const { formatted: fiatValueInputFormatted } = useUSDCValue(
        tryParseAmount(parsedAmounts[SwapField.INPUT]?.toSignificant(parsedAmounts[SwapField.INPUT]?.currency.decimals || 6), baseCurrency)
    );
    const { formatted: fiatValueOutputFormatted } = useUSDCValue(
        tryParseAmount(
            parsedAmounts[SwapField.OUTPUT]?.toSignificant(parsedAmounts[SwapField.OUTPUT]?.currency.decimals || 6),
            quoteCurrency
        )
    );

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]:
            showWrap && independentField !== SwapField.LIMIT_ORDER_PRICE
                ? parsedAmounts[independentField]?.toExact() ?? ""
                : parsedAmounts[dependentField]?.toExact() ?? "",
    };

    return (
        <div className="flex flex-col gap-1 relative">
            <TokenCard
                value={formattedAmounts[SwapField.INPUT] || ""}
                currency={baseCurrency}
                otherCurrency={quoteCurrency}
                handleTokenSelection={handleInputSelect}
                handleValueChange={handleTypeInput}
                handleMaxValue={handleMaxInput}
                fiatValue={fiatValueInputFormatted ?? undefined}
                showMaxButton={showMaxButton}
                showBalance={true}
            />
            <button
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-card-dark w-fit rounded-full border-[5px] border-white hover:bg-card-hover duration-200"
                onClick={onSwitchTokens}
            >
                <ChevronsUpDownIcon size={16} />
            </button>
            <TokenCard
                value={formattedAmounts[SwapField.OUTPUT] || ""}
                currency={quoteCurrency}
                otherCurrency={baseCurrency}
                handleTokenSelection={handleOutputSelect}
                handleValueChange={handleTypeOutput}
                fiatValue={fiatValueOutputFormatted ?? undefined}
                showBalance={true}
            />
        </div>
    );
};

export default SwapPair;
