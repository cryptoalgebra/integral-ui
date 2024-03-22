import TokenCard from '@/components/swap/TokenCard';
import { IDerivedMintInfo, useMintActionHandlers } from '@/state/mintStore';
import { useSwapActionHandlers, useSwapState } from '@/state/swapStore';
import { SwapField } from '@/types/swap-field';
import { Currency } from '@cryptoalgebra/integral-sdk';
import { ChevronsUpDownIcon } from 'lucide-react';
import { useCallback } from 'react';

interface ISelectPair {
    mintInfo: IDerivedMintInfo;
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
}

const SelectPair = ({ mintInfo, currencyA, currencyB }: ISelectPair) => {
    const { onCurrencySelection, onUserInput, onSwitchTokens } =
        useSwapActionHandlers();

    const { onStartPriceInput } = useMintActionHandlers(mintInfo.noLiquidity);

    const { typedValue } = useSwapState();

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
            onStartPriceInput(value);
        },
        [onUserInput, onStartPriceInput]
    );

    return (
        <div className="relative flex flex-col gap-2 items-center">
            <TokenCard
                showBalance={false}
                value={typedValue}
                handleTokenSelection={handleInputSelect}
                currency={currencyA}
                otherCurrency={currencyB}
                handleValueChange={handleTypeInput}
            />

            <button
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-card-dark w-fit rounded-full border-[5px] border-[#1a1d2b] hover:bg-card-hover duration-200"
                onClick={onSwitchTokens}
            >
                <ChevronsUpDownIcon size={16} />
            </button>

            <TokenCard
                disabled
                showBalance={false}
                value={'1'}
                currency={currencyB}
                otherCurrency={currencyA}
                handleTokenSelection={handleOutputSelect}
            />
        </div>
    );
};

export default SelectPair;
