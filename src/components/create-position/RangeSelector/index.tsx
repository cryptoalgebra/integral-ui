import { IDerivedMintInfo } from "@/state/mintStore";
import { Bound, Currency, Price } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import RangeSelectorPart from "../RangeSelectorPart";

export interface RangeSelectorProps {
    priceLower: Price<Currency, Currency> | undefined;
    priceUpper: Price<Currency, Currency> | undefined;
    onLeftRangeInput: (typedValue: string) => void;
    onRightRangeInput: (typedValue: string) => void;
    getDecrementLower: () => string;
    getIncrementLower: () => string;
    getDecrementUpper: () => string;
    getIncrementUpper: () => string;
    currencyA: Currency | null | undefined;
    currencyB: Currency | null | undefined;
    disabled: boolean;
    mintInfo: IDerivedMintInfo;
}

const RangeSelector = ({
    priceLower,
    priceUpper,
    onLeftRangeInput,
    onRightRangeInput,
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
    currencyA,
    currencyB,
    disabled,
    mintInfo,
}: RangeSelectorProps) => {
    const tokenA = (currencyA ?? undefined)?.wrapped;
    const tokenB = (currencyB ?? undefined)?.wrapped;

    const isSorted = useMemo(() => {
        return tokenA && tokenB && tokenA.sortsBefore(tokenB);
    }, [tokenA, tokenB]);

    const leftPrice = useMemo(() => {
        return isSorted ? priceLower : priceUpper?.invert();
    }, [isSorted, priceLower, priceUpper]);

    const rightPrice = useMemo(() => {
        return isSorted ? priceUpper : priceLower?.invert();
    }, [isSorted, priceUpper, priceLower]);

    return (
        <>
            <div className="flex gap-4">
                <RangeSelectorPart
                    value={mintInfo.ticksAtLimit[Bound.LOWER] ? "0" : leftPrice?.toSignificant(5) ?? ""}
                    onUserInput={onLeftRangeInput}
                    width="100%"
                    decrement={isSorted ? getDecrementLower : getIncrementUpper}
                    increment={isSorted ? getIncrementLower : getDecrementUpper}
                    decrementDisabled={mintInfo.ticksAtLimit[Bound.LOWER]}
                    incrementDisabled={mintInfo.ticksAtLimit[Bound.LOWER]}
                    label={leftPrice ? `${currencyB?.symbol}` : "-"}
                    initialPrice={mintInfo.price}
                    disabled={disabled}
                    title={"Min price"}
                />
                <RangeSelectorPart
                    value={mintInfo.ticksAtLimit[Bound.UPPER] ? "∞" : rightPrice?.toSignificant(5) ?? ""}
                    onUserInput={onRightRangeInput}
                    decrement={isSorted ? getDecrementUpper : getIncrementLower}
                    increment={isSorted ? getIncrementUpper : getDecrementLower}
                    incrementDisabled={mintInfo.ticksAtLimit[Bound.UPPER]}
                    decrementDisabled={mintInfo.ticksAtLimit[Bound.UPPER]}
                    label={rightPrice ? `${currencyB?.symbol}` : "-"}
                    initialPrice={mintInfo.price}
                    disabled={disabled}
                    title={`Max price`}
                />
            </div>
        </>
    );
};

export default RangeSelector;
