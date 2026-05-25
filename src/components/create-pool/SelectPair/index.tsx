import TokenCard from "@/components/swap/TokenCard";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { IDerivedMintInfo, useMintActionHandlers, useMintState } from "@/state/mintStore";
import { useSwapActionHandlers } from "@/state/swapStore";
import { SwapField } from "@/types/swap-field";
import { Currency, tryParseAmount } from "@cryptoalgebra/integral-sdk";
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
            onStartPriceInput(value);
        },
        [onStartPriceInput],
    );

    return (
        <div className="flex flex-col gap-1 relative">
            <TokenCard
                label="Token A"
                disabled
                value={"1"}
                currency={currencyA}
                otherCurrency={currencyB}
                handleTokenSelection={handleInputSelect}
                usdValue={usdValueA}
            />

            <div className="flex justify-center -my-4 relative z-10">
                <button
                    className="p-2 bg-card border border-card-border rounded-xl hover:bg-bg-200 transition-all duration-200 hover:rotate-180"
                    onClick={onSwitchTokens}
                >
                    <ChevronsUpDownIcon size={16} className="text-text-200" />
                </button>
            </div>

            <TokenCard
                label="Token B"
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
