import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { IDerivedSwapInfo, useSwapActionHandlers, useSwapState } from "@/state/swapStore";
import { SwapField, SwapFieldType } from "@/types/swap-field";
import { Currency, CurrencyAmount, Percent, maxAmountSpend, ZERO, WNATIVE } from "@cryptoalgebra/integral-sdk";
import { useCallback, useEffect, useMemo } from "react";
import TokenCard from "../TokenCard";
import { ArrowDownIcon } from "lucide-react";
// import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import { TOKENS } from "config";
import { useChainId } from "wagmi";
import { TradeState } from "@/types/trade-state";

const SwapPair = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const chainId = useChainId();

    const { independentField, typedValue } = useSwapState();

    const { currencyBalances, parsedAmounts, currencies, toggledTrade: trade, tradeState } = derivedSwap;

    const isTradeLoading = tradeState.state === TradeState.LOADING || tradeState.state === TradeState.SYNCING;

    const baseCurrency = currencies[SwapField.INPUT];
    const quoteCurrency = currencies[SwapField.OUTPUT];

    // const { wrapType } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    // const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;

    // const limitOrderPoolAddress =
    //     enabledModules.limitOrders && baseCurrency && quoteCurrency && CUSTOM_POOL_DEPLOYER_ADDRESSES.ALL_INCLUSIVE[chainId] && !showWrap
    //         ? (computeCustomPoolAddress({
    //               tokenA: baseCurrency.wrapped,
    //               tokenB: quoteCurrency.wrapped,
    //               customPoolDeployer: CUSTOM_POOL_DEPLOYER_ADDRESSES.ALL_INCLUSIVE[chainId],
    //           }) as Address)
    //         : undefined;

    // const [, limitOrderPool] = usePool(limitOrderPoolAddress);

    // const pairPrice = getTickToPrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, limitOrderPool?.tickCurrent);

    const dependentField: SwapFieldType = independentField === SwapField.INPUT ? SwapField.OUTPUT : SwapField.INPUT;

    const { onSwitchTokens, onCurrencySelection, onUserInput } = useSwapActionHandlers();

    const handleInputSelect = useCallback(
        (inputCurrency: Currency) => {
            onCurrencySelection(SwapField.INPUT, inputCurrency);
        },
        [onCurrencySelection],
    );

    const handleOutputSelect = useCallback(
        (outputCurrency: Currency) => {
            onCurrencySelection(SwapField.OUTPUT, outputCurrency);
        },
        [onCurrencySelection],
    );

    const handleTypeInput = useCallback(
        (value: string) => {
            onUserInput(SwapField.INPUT, value);
        },
        [onUserInput],
    );
    const handleTypeOutput = useCallback(
        (value: string) => {
            onUserInput(SwapField.OUTPUT, value);
        },
        [onUserInput],
    );

    const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[SwapField.INPUT]);
    const showMaxButton = Boolean(maxInputAmount?.greaterThan(0));

    const handleMaxInput = useCallback(() => {
        maxInputAmount && onUserInput(SwapField.INPUT, maxInputAmount.toExact());
    }, [maxInputAmount, onUserInput]);

    const handleInputPercentage = useCallback(
        (percent: 25 | 50 | 75) => {
            if (!maxInputAmount) return;

            const presetAmount = maxInputAmount.multiply(new Percent(percent, 100));
            onUserInput(SwapField.INPUT, presetAmount.toExact());
        },
        [maxInputAmount, onUserInput],
    );

    const { formatted: usdValueA } = useUSDCValue(parsedAmounts[SwapField.INPUT]);
    const { formatted: usdValueB } = useUSDCValue(parsedAmounts[SwapField.OUTPUT]);

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: parsedAmounts[dependentField]?.toExact() ?? "",
    };

    const percentDifference = useMemo(() => {
        if (
            isTradeLoading ||
            !trade?.inputAmount.equalTo(parsedAmounts[SwapField.INPUT]?.quotient || ZERO) ||
            !trade?.outputAmount.equalTo(parsedAmounts[SwapField.OUTPUT]?.quotient || ZERO)
        )
            return;
        if (!usdValueA || !usdValueB) return 0;
        return ((usdValueB - usdValueA) / usdValueA) * 100;
    }, [isTradeLoading, trade?.inputAmount, trade?.outputAmount, parsedAmounts, usdValueA, usdValueB]);

    useEffect(() => {
        handleInputSelect(WNATIVE[chainId].wrapped);
        handleOutputSelect(TOKENS[chainId].USDC);
    }, [chainId, handleOutputSelect, handleInputSelect]);

    return (
        <div className="relative flex flex-col gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
            <TokenCard
                label="Sell"
                value={formattedAmounts[SwapField.INPUT]}
                currency={baseCurrency}
                otherCurrency={quoteCurrency}
                handleTokenSelection={handleInputSelect}
                handleValueChange={handleTypeInput}
                handleMaxValue={handleMaxInput}
                onPercentAmountSelect={handleInputPercentage}
                usdValue={usdValueA ?? undefined}
                showMaxButton={showMaxButton}
                isLoading={independentField === SwapField.OUTPUT && isTradeLoading}
                showBalance
                showPercentButtons
            />
            <button
                type="button"
                className="group absolute left-1/2 top-[calc(50%+4px)] z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform-gpu items-center justify-center rounded-full border border-border bg-background text-text shadow-sm transition-all duration-300 ease-out hover:scale-105 hover:border-primary hover:text-primary hover:shadow-md active:scale-95"
                onClick={() => onSwitchTokens(formattedAmounts[SwapField.OUTPUT])}
            >
                <ArrowDownIcon size={18} className="transition-transform duration-300 group-hover:rotate-180" />
            </button>
            <TokenCard
                label="Buy"
                value={formattedAmounts[SwapField.OUTPUT]}
                currency={quoteCurrency}
                otherCurrency={baseCurrency}
                handleTokenSelection={handleOutputSelect}
                handleValueChange={handleTypeOutput}
                usdValue={usdValueB ?? undefined}
                percentDifference={percentDifference}
                isLoading={independentField === SwapField.INPUT && isTradeLoading}
                showBalance
                disabled
            />
        </div>
    );
};

export default SwapPair;
