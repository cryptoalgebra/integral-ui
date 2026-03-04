import { Currency, Price, Token } from "@cryptoalgebra/custom-pools-sdk";
import { IDerivedMintInfo } from "@/state/mintStore";
import LiquidityChart from "@/components/create-position/LiquidityChart";
import RangeSelector from "@/components/create-position/RangeSelector";

interface NewPositionRangeProps {
    priceLower: Price<Token, Token> | undefined;
    priceUpper: Price<Token, Token> | undefined;
    getDecrementLower: () => string;
    getIncrementLower: () => string;
    getDecrementUpper: () => string;
    getIncrementUpper: () => string;
    onLeftRangeInput: (typedValue: string) => void;
    onRightRangeInput: (typedValue: string) => void;
    currencyA: Currency | null | undefined;
    currencyB: Currency | null | undefined;
    mintInfo: IDerivedMintInfo;
    currentPriceValue?: number;
    currentPriceLabel?: string;
    startPriceTypedValue?: string;
    useV2?: boolean;
}

export default function NewPositionRange({
    priceLower,
    priceUpper,
    getDecrementLower,
    getIncrementLower,
    getDecrementUpper,
    getIncrementUpper,
    onLeftRangeInput,
    onRightRangeInput,
    currencyA,
    currencyB,
    mintInfo,
    currentPriceValue,
    currentPriceLabel,
    startPriceTypedValue,
    useV2 = false,
}: NewPositionRangeProps) {
    return (
        <>
            <div className="flex w-full flex-col md:flex-row gap-4">
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
                <div className="md:ml-auto md:text-right">
                    <div className="font-bold text-xs mb-3 text-white/75">CURRENT PRICE</div>
                    <div className="font-bold text-xl">{currentPriceLabel ?? "--"}</div>
                </div>
            </div>

            <LiquidityChart
                currencyA={currencyA}
                currencyB={currencyB}
                pool={mintInfo.pool}
                currentPrice={currentPriceValue}
                priceLower={priceLower}
                priceUpper={priceUpper}
                ticksAtLimit={mintInfo.ticksAtLimit}
                onLeftRangeInput={onLeftRangeInput}
                onRightRangeInput={onRightRangeInput}
                useV2={useV2}
            />
        </>
    );
}
