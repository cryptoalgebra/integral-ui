import { InputModeV2, LiquidityRangeChartV2, TimePeriodV2 } from "@/components/Charts/D3LiquidityRangeInputV2";
import EnterAmounts from "@/components/create-position/EnterAmounts";
import AddLiquidityButton from "@/components/create-position/AddLiquidityButton";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useDerivedMintInfo, useMintActionHandlers } from "@/state/mintStore";
import { INITIAL_POOL_FEE } from "@cryptoalgebra/custom-pools-sdk";
import { useEffect, type Dispatch, type SetStateAction } from "react";
import { Address } from "viem";

interface CreatePositionLayoutProps {
    poolId?: string;
    poolPriceLoading: boolean;
    densityLoading: boolean;
    chartReady: boolean;
    v2PriceData: { time: number; value: number; open: number; high: number; low: number; close: number }[];
    v2LiquidityData: { tick: number; price0: number; activeLiquidity: number }[];
    token0Symbol?: string;
    token1Symbol?: string;
    token0Address?: string;
    token1Address?: string;
    chartCurrentPrice?: number;
    chartMinPrice?: number;
    chartMaxPrice?: number;
    chartInputMode: InputModeV2;
    chartTimePeriod: TimePeriodV2;
    chartIsFullRange: boolean;
    setChartMinPrice: Dispatch<SetStateAction<number | undefined>>;
    setChartMaxPrice: Dispatch<SetStateAction<number | undefined>>;
    setChartInputMode: Dispatch<SetStateAction<InputModeV2>>;
    setChartTimePeriod: Dispatch<SetStateAction<TimePeriodV2>>;
    setChartIsFullRange: Dispatch<SetStateAction<boolean>>;
}

export default function CreatePositionLayout({
    poolId,
    poolPriceLoading,
    densityLoading,
    chartReady,
    v2PriceData,
    v2LiquidityData,
    token0Symbol,
    token1Symbol,
    token0Address,
    token1Address,
    chartCurrentPrice,
    chartMinPrice,
    chartMaxPrice,
    chartInputMode,
    chartTimePeriod,
    chartIsFullRange,
    setChartMinPrice,
    setChartMaxPrice,
    setChartInputMode,
    setChartTimePeriod,
    setChartIsFullRange,
}: CreatePositionLayoutProps) {
    const currencyA = useCurrency(token0Address as Address, true);
    const currencyB = useCurrency(token1Address as Address, true);
    const mintInfo = useDerivedMintInfo(currencyA, currencyB, poolId as Address, INITIAL_POOL_FEE, currencyA);
    const { onLeftRangeInput, onRightRangeInput } = useMintActionHandlers(mintInfo.noLiquidity);

    useEffect(() => {
        if (typeof chartMinPrice === "number") onLeftRangeInput(String(chartMinPrice));
    }, [chartMinPrice, onLeftRangeInput]);

    useEffect(() => {
        if (typeof chartMaxPrice === "number") onRightRangeInput(String(chartMaxPrice));
    }, [chartMaxPrice, onRightRangeInput]);

    return (
        <section className="min-h-[640px] bg-card-background p-8 text-left animate-fade-in border-l">
            <h1 className="text-3xl font-bold">Create Position</h1>
            <div className="mt-6 min-w-0 space-y-7">
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold">1. Select Range</h2>
                    <p className="text-sm text-foreground/70">Choose your min/max range and optional preset strategy.</p>
                    {poolPriceLoading || densityLoading ? (
                        <div className="h-[300px] text-sm text-foreground/60">Loading chart...</div>
                    ) : !chartReady ? (
                        <div className="h-[300px] text-sm text-foreground/60">Not enough chart data for this pool yet.</div>
                    ) : (
                        <LiquidityRangeChartV2
                            priceData={v2PriceData}
                            liquidityData={v2LiquidityData}
                            quoteSymbol={token1Symbol}
                            baseSymbol={token0Symbol}
                            quoteTokenAddress={token1Address}
                            baseTokenAddress={token0Address}
                            currentPrice={chartCurrentPrice}
                            initialMinPrice={chartMinPrice}
                            initialMaxPrice={chartMaxPrice}
                            initialInputMode={chartInputMode}
                            initialTimePeriod={chartTimePeriod}
                            initialFullRange={chartIsFullRange}
                            onMinPriceChange={(price) => {
                                setChartMinPrice(price);
                                if (typeof price === "number") onLeftRangeInput(String(price));
                            }}
                            onMaxPriceChange={(price) => {
                                setChartMaxPrice(price);
                                if (typeof price === "number") onRightRangeInput(String(price));
                            }}
                            onInputModeChange={setChartInputMode}
                            onTimePeriodChange={setChartTimePeriod}
                            onFullRangeChange={setChartIsFullRange}
                        />
                    )}
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg font-semibold">2. Enter Amounts</h2>
                    <p className="text-sm text-foreground/70">Enter deposit amounts for both tokens. You can use Max from wallet balance.</p>
                    <EnterAmounts currencyA={currencyA} currencyB={currencyB} mintInfo={mintInfo} />
                </div>

                <div className="pt-1">
                    <AddLiquidityButton baseCurrency={currencyA} quoteCurrency={currencyB} mintInfo={mintInfo} poolAddress={poolId as Address} />
                </div>
            </div>
        </section>
    );
}
