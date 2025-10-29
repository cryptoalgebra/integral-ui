import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { IDerivedSwapInfo, useSwapActionHandlers, useSwapState } from "@/state/swapStore";
import { SwapField, SwapFieldType } from "@/types/swap-field";
import { Currency, CurrencyAmount, maxAmountSpend, ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { useCallback, useEffect, useMemo } from "react";
import TokenCard from "../TokenCard";
import { ChevronsUpDownIcon } from "lucide-react";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
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

    const { wrapType } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;

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

    const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalances[SwapField.INPUT]);
    const showMaxButton = Boolean(maxInputAmount?.greaterThan(0));

    const handleMaxInput = useCallback(() => {
        maxInputAmount && onUserInput(SwapField.INPUT, maxInputAmount.toExact());
    }, [maxInputAmount, onUserInput]);

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
        <div className="flex flex-col gap-1 relative ">
            <TokenCard
                value={formattedAmounts[SwapField.INPUT]}
                currency={baseCurrency}
                otherCurrency={quoteCurrency}
                handleTokenSelection={handleInputSelect}
                handleValueChange={handleTypeInput}
                handleMaxValue={handleMaxInput}
                usdValue={usdValueA ?? undefined}
                showMaxButton={showMaxButton}
                showBalance={true}
                isLoading={independentField === SwapField.OUTPUT && isTradeLoading}
            />
            <button
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-card-dark w-fit rounded-full border-[5px] border-card-border hover:bg-card-hover duration-200"
                onClick={onSwitchTokens}
            >
                <ChevronsUpDownIcon size={16} />
            </button>
            <TokenCard
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
