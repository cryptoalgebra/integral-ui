import LiquidityChartRangeInput from "@/components/common/LiquidityChartRangeInput";
import AmountsSection from "@/components/create-position/AmountsSection";
import PresetTabs from "@/components/create-position/PresetTabs";
import RangeSelector from "@/components/create-position/RangeSelector";
import { useReadAlgebraPoolToken0, useReadAlgebraPoolToken1 } from "@/generated";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useDerivedMintInfo, useRangeHopCallbacks, useMintActionHandlers, useMintState } from "@/state/mintStore";
import { formatAmount } from "@/utils";
import { INITIAL_POOL_FEE, Bound, nearestUsableTick, TickMath } from "@cryptoalgebra/integral-sdk";
import { ArrowUpDown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Address } from "viem";

interface ManualProps {
    poolAddress?: Address;
    handleCloseModal?: () => void;
}

export function CreateManualPosition({ poolAddress, handleCloseModal }: ManualProps) {
    const { data: token0 } = useReadAlgebraPoolToken0({
        address: poolAddress,
    });

    const { data: token1 } = useReadAlgebraPoolToken1({
        address: poolAddress,
    });

    const currency0 = useCurrency(token0, true);
    const currency1 = useCurrency(token1, true);

    const [wasManuallyToggled, setWasManuallyToggled] = useState(false);

    const [currencyA, currencyB] = useMemo(() => {
        if (wasManuallyToggled) {
            return [currency1, currency0];
        } else {
            return [currency0, currency1];
        }
    }, [currency0, currency1, wasManuallyToggled]);

    const mintInfo = useDerivedMintInfo(
        currencyA ?? undefined,
        currencyB ?? undefined,
        poolAddress,
        INITIAL_POOL_FEE,
        currencyA ?? undefined,
        undefined,
    );

    const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = mintInfo.pricesAtTicks;

    const hidePresets = mintInfo.pool
        ? mintInfo.pool.tickCurrent === nearestUsableTick(TickMath.MAX_TICK, mintInfo.pool.tickSpacing) ||
          mintInfo.pool.tickCurrent === nearestUsableTick(TickMath.MIN_TICK, mintInfo.pool.tickSpacing)
        : false;

    const price = useMemo(() => {
        if (!mintInfo.price) return;

        return mintInfo.invertPrice ? mintInfo.price.invert().toSignificant(24) : mintInfo.price.toSignificant(24);
    }, [mintInfo]);

    const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = useMemo(() => {
        return mintInfo.ticks;
    }, [mintInfo]);

    const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper } = useRangeHopCallbacks(
        currencyA ?? undefined,
        currencyB ?? undefined,
        mintInfo.tickSpacing,
        tickLower,
        tickUpper,
        mintInfo.pool,
    );

    const { onLeftRangeInput, onRightRangeInput } = useMintActionHandlers(mintInfo.noLiquidity);

    const { startPriceTypedValue } = useMintState();

    const handleCurrencyToggle = () => {
        setWasManuallyToggled(!wasManuallyToggled);
        if (!mintInfo.ticksAtLimit[Bound.LOWER] && !mintInfo.ticksAtLimit[Bound.UPPER]) {
            onLeftRangeInput((mintInfo.invertPrice ? priceLower : priceUpper?.invert())?.toSignificant(6) ?? "");
            onRightRangeInput((mintInfo.invertPrice ? priceUpper : priceLower?.invert())?.toSignificant(6) ?? "");
        }
    };

    useEffect(() => {
        return () => {
            onLeftRangeInput("");
            onRightRangeInput("");
        };
    }, [onLeftRangeInput, onRightRangeInput]);

    return (
        <div className="flex w-full flex-col gap-4 text-left">
            <LiquidityChartRangeInput
                pool={mintInfo.pool}
                priceLower={priceLower}
                priceUpper={priceUpper}
                ticksAtLimit={mintInfo.ticksAtLimit}
                price={price ? parseFloat(price) : undefined}
                onLeftRangeInput={onLeftRangeInput}
                onRightRangeInput={onRightRangeInput}
                width={window.innerWidth > 768 ? 900 : 380}
                isSorted={!wasManuallyToggled}
                // minPrice24h={minPrice24h}
                // maxPrice24h={maxPrice24h}
                // marketPrice={isPoolOnBoundary ? Number(marketPrice?.toSignificant(24)) : undefined}
                // isStable={isStablecoinPair(currency0?.wrapped, currency1?.wrapped)}
            />

            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-panel text-sm font-medium text-text">
                            1
                        </div>

                        <h2 className="font-medium text-text text-xs uppercase tracking-[2px]">Select Price Range</h2>
                    </div>

                    {!hidePresets && <PresetTabs currencyA={currencyA} currencyB={currencyB} mintInfo={mintInfo} />}

                    {/* <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-xs font-medium uppercase tracking-[2px] text-text-muted">Current Price</div>
                            <div className="mt-1 text-xs font-medium text-text md:text-lg">
                                {price ? `1 ${currencyA?.symbol} = ${formatAmount(price || 0, 8)} ${currencyB?.symbol}` : "Not available"}
                            </div>
                        </div>

                        <div className="flex items-center gap-1 self-start rounded-lg border p-1">
                            <Button
                                className="text-xs"
                                size={"sm"}
                                variant={wasManuallyToggled ? "icon" : "iconHover"}
                                onClick={handleCurrencyToggle}
                            >
                                {currency0?.symbol}
                            </Button>
                            <Button
                                className="text-xs"
                                size={"sm"}
                                variant={!wasManuallyToggled ? "icon" : "iconHover"}
                                onClick={handleCurrencyToggle}
                            >
                                {currency1?.symbol}
                            </Button>
                        </div>
                    </div> */}

                    <div className="flex items-center justify-between gap-1 text-sm border p-2 rounded-md">
                        <span className="text-xs">Current Price:</span>
                        <button className="flex items-center gap-1 text-accent hover:text-accent/80" onClick={handleCurrencyToggle}>
                            <span className="font-medium ">
                                {price ? `1 ${currencyA?.symbol} = ${formatAmount(price || 0, 8)} ${currencyB?.symbol}` : "-"}
                            </span>
                            <ArrowUpDown size={12} />
                        </button>
                    </div>

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

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-panel text-sm font-medium text-text">
                            2
                        </div>

                        <h2 className="font-medium text-text text-xs uppercase tracking-[2px]">Enter Amounts</h2>
                    </div>
                    <AmountsSection currencyA={currencyA} currencyB={currencyB} mintInfo={mintInfo} handleCloseModal={handleCloseModal} />
                </div>
            </div>
        </div>
    );
}
