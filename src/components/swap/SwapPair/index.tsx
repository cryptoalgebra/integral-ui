import { useUSDCValue } from '@/hooks/common/useUSDCValue';
import {
    IDerivedSwapInfo,
    useSwapActionHandlers,
    useSwapState,
} from '@/state/swapStore';
import { SwapField, SwapFieldType } from '@/types/swap-field';
import {
    Currency,
    CurrencyAmount,
    maxAmountSpend, TradeType,
    tryParseAmount,
} from '@cryptoalgebra/custom-pools-sdk';
import { useCallback, useMemo } from 'react';
import TokenCard from '../TokenCard';
import { ChevronsUpDownIcon } from 'lucide-react';
import useWrapCallback, { WrapType } from '@/hooks/swap/useWrapCallback';
import {SmartRouterTrade} from "@cryptoalgebra/router-custom-pools";

const SwapPair = ({ derivedSwap, smartTrade }: { derivedSwap: IDerivedSwapInfo, smartTrade: SmartRouterTrade<TradeType> }) => {
    const {
        currencyBalances,
        parsedAmount,
        currencies,
    } = derivedSwap;

    const baseCurrency = currencies[SwapField.INPUT];
    const quoteCurrency = currencies[SwapField.OUTPUT];

    const { independentField, typedValue } = useSwapState();
    const dependentField: SwapFieldType =
        independentField === SwapField.INPUT
            ? SwapField.OUTPUT
            : SwapField.INPUT;

    const { onSwitchTokens, onCurrencySelection, onUserInput } =
        useSwapActionHandlers();

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

    const { wrapType } = useWrapCallback(
        currencies[SwapField.INPUT],
        currencies[SwapField.OUTPUT],
        typedValue
    );

    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;

    const parsedAmountA =
        independentField === SwapField.INPUT
            ? parsedAmount
            : tryParseAmount(smartTrade?.inputAmount?.toSignificant(), smartTrade?.inputAmount?.currency);

    const parsedAmountB =
        independentField === SwapField.OUTPUT
            ? parsedAmount
            : tryParseAmount(smartTrade?.outputAmount?.toSignificant(), smartTrade?.outputAmount?.currency);

    const parsedAmounts = useMemo(
        () =>
            showWrap
                ? {
                      [SwapField.INPUT]: parsedAmount,
                      [SwapField.OUTPUT]: parsedAmount,
                  }
                : {
                      [SwapField.INPUT]: parsedAmountA,
                      [SwapField.OUTPUT]: parsedAmountB,
                  },
        [parsedAmount, showWrap, parsedAmountA, parsedAmountB]
    );

    const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(
        currencyBalances[SwapField.INPUT]
    );
    const showMaxButton = Boolean(
        maxInputAmount?.greaterThan(0) &&
            !parsedAmounts[SwapField.INPUT]?.equalTo(maxInputAmount)
    );

    const handleMaxInput = useCallback(() => {
        maxInputAmount &&
            onUserInput(SwapField.INPUT, maxInputAmount.toExact());
    }, [maxInputAmount, onUserInput]);

    const { formatted: fiatValueInputFormatted } = useUSDCValue(
        tryParseAmount(
            parsedAmounts[SwapField.INPUT]?.toSignificant(
                (parsedAmounts[SwapField.INPUT]?.currency.decimals || 6) / 2
            ),
            baseCurrency
        )
    );
    const { formatted: fiatValueOutputFormatted } = useUSDCValue(
        tryParseAmount(
            parsedAmounts[SwapField.OUTPUT]?.toSignificant(
                (parsedAmounts[SwapField.OUTPUT]?.currency.decimals || 6) / 2
            ),
            quoteCurrency
        )
    );

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: showWrap
            ? parsedAmounts[independentField]?.toExact() ?? ''
            : parsedAmounts[dependentField]?.toFixed(
                  (parsedAmounts[dependentField]?.currency.decimals || 6) / 2
              ) ?? '',
    };

    return (
        <div className="flex flex-col gap-1 relative">
            <TokenCard
                value={formattedAmounts[SwapField.INPUT] || ''}
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
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-card-dark w-fit rounded-full border-[5px] border-[#1a1d2b] hover:bg-card-hover duration-200"
                onClick={onSwitchTokens}
            >
                <ChevronsUpDownIcon size={16} />
            </button>
            <TokenCard
                value={formattedAmounts[SwapField.OUTPUT] || ''}
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
