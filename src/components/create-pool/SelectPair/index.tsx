import TokenCard from "@/components/swap/TokenCard";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { IDerivedMintInfo, useMintActionHandlers, useMintState } from "@/state/mintStore";
import { useSwapActionHandlers } from "@/state/swapStore";
import { SwapField } from "@/types/swap-field";
import { Currency, tryParseAmount } from "@cryptoalgebra/integral-sdk";
import { ArrowDownIcon } from "lucide-react";
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
        <div className="relative flex flex-col gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
            <TokenCard
                label="Base asset"
                disabled
                value={"1"}
                currency={currencyA}
                otherCurrency={currencyB}
                handleTokenSelection={handleInputSelect}
                usdValue={usdValueA}
                showBalance={false}
            />
            <button
                type="button"
                className="group absolute left-1/2 top-[calc(50%+4px)] z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform-gpu items-center justify-center rounded-full border border-border bg-background text-text shadow-sm transition-all duration-300 ease-out hover:scale-105 hover:border-primary hover:text-primary hover:shadow-md active:scale-95"
                onClick={() => onSwitchTokens("1")}
            >
                <ArrowDownIcon size={18} className="transition-transform duration-300 group-hover:rotate-180" />
            </button>
            <TokenCard
                label="Initial price"
                value={startPriceTypedValue}
                handleTokenSelection={handleOutputSelect}
                currency={currencyB}
                otherCurrency={currencyA}
                handleValueChange={handleTypeInput}
                usdValue={usdValueB}
                showBalance={false}
            />
        </div>
    );
};

export default SelectPair;
