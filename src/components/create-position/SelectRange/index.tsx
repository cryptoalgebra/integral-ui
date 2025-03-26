import { IDerivedMintInfo, useMintState, useRangeHopCallbacks, useMintActionHandlers } from "@/state/mintStore";
import { Bound, Currency } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import RangeSelector from "../RangeSelector";

interface SelectRangeProps {
    currencyA: Currency | null | undefined;
    currencyB: Currency | null | undefined;
    mintInfo: IDerivedMintInfo;
    isCompleted: boolean;
    additionalStep: boolean;
    disabled: boolean;
    backStep: number;
}

const SelectRange = ({ currencyA, currencyB, mintInfo }: SelectRangeProps) => {
    const { startPriceTypedValue } = useMintState();

    const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = useMemo(() => {
        return mintInfo.ticks;
    }, [mintInfo]);

    const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = useMemo(() => {
        return mintInfo.pricesAtTicks;
    }, [mintInfo]);

    const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper } = useRangeHopCallbacks(
        currencyA ?? undefined,
        currencyB ?? undefined,
        mintInfo.tickSpacing,
        tickLower,
        tickUpper,
        mintInfo.pool
    );

    const { onLeftRangeInput, onRightRangeInput } = useMintActionHandlers(mintInfo.noLiquidity);

    // const tokenA = (currencyA ?? undefined)?.wrapped;
    // const tokenB = (currencyB ?? undefined)?.wrapped;

    // const isSorted = useMemo(() => {
    //     return tokenA && tokenB && tokenA.sortsBefore(tokenB);
    // }, [tokenA, tokenB, mintInfo]);

    // const leftPrice = useMemo(() => {
    //     return isSorted ? priceLower : priceUpper?.invert();
    // }, [isSorted, priceLower, priceUpper, mintInfo]);

    // const rightPrice = useMemo(() => {
    //     return isSorted ? priceUpper : priceLower?.invert();
    // }, [isSorted, priceUpper, priceLower, mintInfo]);

    // const price = useMemo(() => {
    //     if (!mintInfo.price) return;

    //     return mintInfo.invertPrice
    //         ? mintInfo.price.invert().toSignificant(5)
    //         : mintInfo.price.toSignificant(5);
    // }, [mintInfo]);

    return (
        <div className="flex flex-col">
            <div className="mb-1">
                <RangeSelector
                    priceLower={priceLower}
                    priceUpper={priceUpper}
                    getDecrementLower={getDecrementLower}
                    getIncrementLower={getIncrementLower}
                    getDecrementUpper={getDecrementUpper}
                    getIncrementUpper={getIncrementUpper}
                    onLeftRangeInput={onLeftRangeInput}
                    onRightRangeInput={onRightRangeInput}
                    currencyA={currencyA}
                    currencyB={currencyB}
                    mintInfo={mintInfo}
                    disabled={!startPriceTypedValue && !mintInfo.price}
                />
            </div>
            {mintInfo.outOfRange && <div>Out of range</div>}
            {mintInfo.invalidRange && <div>Invalid range</div>}
        </div>
    );
};

export default SelectRange;
