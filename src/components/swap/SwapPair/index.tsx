import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { IDerivedSwapInfo, useSwapActionHandlers, useSwapState } from "@/state/swapStore";
import { SwapField, SwapFieldType } from "@/types/swap-field";
import { Currency, ZERO } from "@cryptoalgebra/integral-sdk";
import { useCallback, useEffect, useMemo } from "react";
import TokenCard from "../TokenCard";
import { ArrowDownIcon } from "lucide-react";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import { TOKENS } from "config";
import { useChainId } from "wagmi";
import { TradeState } from "@/types/trade-state";

const SwapPair = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const chainId = useChainId();

    const { independentField, typedValue } = useSwapState();

    const { parsedAmounts, currencies, toggledTrade: trade, tradeState } = derivedSwap;

    const isTradeLoading = tradeState.state === TradeState.LOADING || tradeState.state === TradeState.SYNCING;

    const baseCurrency = currencies[SwapField.INPUT];
    const quoteCurrency = currencies[SwapField.OUTPUT];

    const { wrapType } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;

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

    const { formatted: usdValueA } = useUSDCValue(parsedAmounts[SwapField.INPUT]);
    const { formatted: usdValueB } = useUSDCValue(parsedAmounts[SwapField.OUTPUT]);

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]:
            showWrap && independentField !== SwapField.LIMIT_ORDER_PRICE
                ? parsedAmounts[independentField]?.toExact() ?? ""
                : parsedAmounts[dependentField]?.toExact() ?? "",
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
        handleOutputSelect(TOKENS[chainId].USDC);
    }, [chainId, handleOutputSelect]);

    return (
        <div className="flex flex-col gap-1 relative">
            <TokenCard
                label="Sell"
                value={formattedAmounts[SwapField.INPUT]}
                currency={baseCurrency}
                otherCurrency={quoteCurrency}
                handleTokenSelection={handleInputSelect}
                handleValueChange={handleTypeInput}
                usdValue={usdValueA ?? undefined}
                showPercentButtons={true}
                isLoading={independentField === SwapField.OUTPUT && isTradeLoading}
            />

            <div className="flex justify-center -my-4 relative z-10">
                <button
                    className="p-2 bg-card border border-card-border rounded-xl hover:bg-bg-200 transition-all duration-200 hover:rotate-180"
                    onClick={onSwitchTokens}
                >
                    <ArrowDownIcon size={16} className="text-text-200" />
                </button>
            </div>

            <TokenCard
                label="Buy"
                value={formattedAmounts[SwapField.OUTPUT]}
                currency={quoteCurrency}
                otherCurrency={baseCurrency}
                handleTokenSelection={handleOutputSelect}
                handleValueChange={handleTypeOutput}
                usdValue={usdValueB ?? undefined}
                percentDifference={percentDifference}
                showBalance={true}
                isLoading={independentField === SwapField.INPUT && isTradeLoading}
            />
        </div>
    );
};

export default SwapPair;
