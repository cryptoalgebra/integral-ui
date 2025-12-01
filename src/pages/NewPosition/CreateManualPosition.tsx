import AmountsSection from "@/components/create-position/AmountsSection";
import LiquidityChart from "@/components/create-position/LiquidityChart";
import PresetTabs from "@/components/create-position/PresetTabs";
import RangeSelector from "@/components/create-position/RangeSelector";
import { Button } from "@/components/ui/button";
import { useReadAlgebraPoolToken0, useReadAlgebraPoolToken1 } from "@/generated";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useDerivedMintInfo, useRangeHopCallbacks, useMintActionHandlers, useMintState } from "@/state/mintStore";
import { INITIAL_POOL_FEE, Bound, nearestUsableTick, TickMath } from "@cryptoalgebra/custom-pools-sdk";
import { useState, useMemo, useEffect } from "react";
import { Address } from "viem";

interface ManualProps {
    poolAddress?: Address;
}

export function CreateManualPosition({ poolAddress }: ManualProps) {
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
        undefined
    );

    const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = mintInfo.pricesAtTicks;

    const hidePresets = mintInfo.pool
        ? mintInfo.pool.tickCurrent === nearestUsableTick(TickMath.MAX_TICK, mintInfo.pool.tickSpacing) ||
          mintInfo.pool.tickCurrent === nearestUsableTick(TickMath.MIN_TICK, mintInfo.pool.tickSpacing)
        : false;

    const price = useMemo(() => {
        if (!mintInfo.price) return;

        return mintInfo.invertPrice ? mintInfo.price.invert().toSignificant(5) : mintInfo.price.toSignificant(5);
    }, [mintInfo]);

    const currentPrice = useMemo(() => {
        if (!mintInfo.price) return;

        if (Number(price) <= 0.0001) {
            return `< 0.0001 ${currencyB?.symbol}`;
        } else {
            return `${price} ${currencyB?.symbol}`;
        }
    }, [mintInfo.price, price]);

    const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = useMemo(() => {
        return mintInfo.ticks;
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
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-3 md:gap-3 w-full text-left">
            <div className="col-span-2">
                <div className="flex flex-col w-full">
                    <div className="w-full p-3 md:p-6 bg-card flex flex-col gap-3 text-left rounded-xl border border-card-border">
                        <div className="flex items-center justify-between w-full">
                            <h2 className="font-semibold text-lg md:text-2xl text-left">Select Range</h2>
                            <div className="flex h-fit w-fit gap-0.5 rounded-xl border border-lighter p-0.5">
                                <Button
                                    className="h-4 rounded-lg text-xs font-normal max-sm:p-3.5"
                                    variant={wasManuallyToggled ? "iconActive" : "icon"}
                                    onClick={handleCurrencyToggle}
                                >
                                    {currency0?.symbol}
                                </Button>
                                <Button
                                    className="h-4 rounded-lg text-xs font-normal max-sm:p-3.5"
                                    variant={!wasManuallyToggled ? "iconActive" : "icon"}
                                    onClick={handleCurrencyToggle}
                                >
                                    {currency1?.symbol}
                                </Button>
                            </div>
                        </div>
                        {!hidePresets && <PresetTabs currencyA={currencyA} currencyB={currencyB} mintInfo={mintInfo} />}
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
                                <div className="font-bold text-xs mb-3 text-text-100/75">CURRENT PRICE</div>
                                <div className="font-bold text-xl">{`${currentPrice}`}</div>
                            </div>
                        </div>

                        <LiquidityChart
                            currencyA={currencyA}
                            currencyB={currencyB}
                            pool={mintInfo.pool}
                            currentPrice={price ? parseFloat(price) : undefined}
                            priceLower={priceLower}
                            priceUpper={priceUpper}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                {/* <h2 className="font-semibold text-2xl text-left mb-6 leading-[44px]">2. Enter Amounts</h2> */}
                <div className="flex flex-col w-full h-fit gap-2 bg-card border border-card-border rounded-xl p-2">
                    <AmountsSection currencyA={currencyA} currencyB={currencyB} mintInfo={mintInfo} />
                </div>
            </div>
        </div>
    );
}
