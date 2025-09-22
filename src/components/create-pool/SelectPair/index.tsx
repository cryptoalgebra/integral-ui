import TokenCard from "@/components/swap/TokenCard";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { IDerivedMintInfo, useMintActionHandlers, useMintState } from "@/state/mintStore";
import { useSwapActionHandlers } from "@/state/swapStore";
import { SwapField } from "@/types/swap-field";
import { Currency, tryParseAmount } from "@cryptoalgebra/custom-pools-sdk";
import { ChevronsUpDownIcon } from "lucide-react";
import { useCallback } from "react";

interface ISelectPair {
    mintInfo: IDerivedMintInfo;
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
}

const SelectPair = ({ mintInfo, currencyA, currencyB }: ISelectPair) => {
    const { onCurrencySelection, onSwitchTokens } = useSwapActionHandlers();

    const { onStartPriceInput } = useMintActionHandlers(mintInfo.noLiquidity);

    const { startPriceTypedValue } = useMintState();

    const { formatted: usdValueA } = useUSDCValue(tryParseAmount("1", currencyA));
    const { formatted: usdValueB } = useUSDCValue(tryParseAmount(startPriceTypedValue, currencyB));

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
            onStartPriceInput(value);
        },
        [onStartPriceInput]
    );

    return (
        <div className="relative flex flex-col gap-1  items-center">
            <TokenCard
                disabled
                value={"1"}
                currency={currencyA}
                otherCurrency={currencyB}
                handleTokenSelection={handleInputSelect}
                usdValue={usdValueA}
            />
            <button
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-card-dark w-fit rounded-full border-[5px] border-card-border hover:bg-card-hover duration-200"
                onClick={onSwitchTokens}
            >
                <ChevronsUpDownIcon size={16} />
            </button>
            <TokenCard
                value={startPriceTypedValue}
                handleTokenSelection={handleOutputSelect}
                currency={currencyB}
                otherCurrency={currencyA}
                handleValueChange={handleTypeInput}
                usdValue={usdValueB}
            />
        </div>
    );
};

export default SelectPair;
