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
        <div className="flex flex-col gap-2 items-center">
            <TokenCard
                showBalance={false}
                value={typedValue}
                handleTokenSelection={handleInputSelect}
                currency={currencyA}
                otherCurrency={currencyB}
                handleValueChange={handleTypeInput}
            />

            <ChevronsUpDownIcon
                onClick={onSwitchTokens}
                className="cursor-pointer w-12"
            />

            <TokenCard
                disabled
                value={'1'}
                currency={currencyB}
                otherCurrency={currencyA}
                handleTokenSelection={handleOutputSelect}
            />
        </div>
    );
};

export default SelectPair;
