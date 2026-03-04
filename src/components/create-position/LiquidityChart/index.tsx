import { useCallback, useMemo } from "react";
import { Bound, Currency, Pool, Price, Token } from "@cryptoalgebra/custom-pools-sdk";
import { Skeleton } from "@/components/ui/skeleton";
import { LiquidityRangeChartV2, PricePointV2 } from "@/components/Charts/D3LiquidityRangeInputV2";
import { useDensityChartData } from "./hooks";
import { ChartVariant, ZoomLevels } from "./types";
import { Chart } from "./Chart";

interface LiquidityChartProps {
    currencyA: Currency | undefined | null;
    currencyB: Currency | undefined | null;
    pool: Pool | null | undefined;
    currentPrice: number | undefined;
    priceLower: Price<Token, Token> | undefined;
    priceUpper: Price<Token, Token> | undefined;
    ticksAtLimit?: { [bound in Bound]?: boolean | undefined };
    onLeftRangeInput?: (typedValue: string) => void;
    onRightRangeInput?: (typedValue: string) => void;
    interactive?: boolean;
    variant?: ChartVariant;
    isOnlyView?: boolean;
    width?: number;
    height?: number;
    isSorted?: boolean;
    isStable?: boolean;
    useV2?: boolean;
}

const DEFAULT_ZOOM_LEVELS: ZoomLevels = {
    initialMin: 0.9,
    initialMax: 1.1,
    min: 0.00001,
    max: 20,
};

const STABLE_ZOOM_LEVELS: ZoomLevels = {
    initialMin: 0.985,
    initialMax: 1.015,
    min: 0.00001,
    max: 20,
};

function formatDelta(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1000) return abs.toFixed(0);
    if (abs >= 100) return abs.toFixed(1);
    if (abs >= 1) return abs.toFixed(2);
    return abs.toFixed(3);
}

const LiquidityChart = ({
    currencyA,
    currencyB,
    pool,
    currentPrice,
    priceLower,
    priceUpper,
    ticksAtLimit = {},
    onLeftRangeInput,
    onRightRangeInput,
    interactive = true,
    variant = "dark",
    isOnlyView = false,
    width = 620,
    height = 230,
    isSorted: isSortedProp,
    isStable = false,
    useV2 = false,
}: LiquidityChartProps) => {
    const isSorted = useMemo(() => {
        if (typeof isSortedProp === "boolean") return isSortedProp;
        const tokenA = currencyA?.wrapped;
        const tokenB = currencyB?.wrapped;
        return Boolean(tokenA && tokenB && tokenA.sortsBefore(tokenB));
    }, [currencyA, currencyB, isSortedProp]);

    const { isLoading: isChartLoading, formattedData } = useDensityChartData({ pool, isSorted });

    const onBrushDomainChangeEnded = useCallback(
        (domain: [number, number], mode: string | undefined) => {
            if (!onLeftRangeInput || !onRightRangeInput) return;

            let leftRangeValue = Number(domain[0]);
            let rightRangeValue = Number(domain[1]);

            if (leftRangeValue <= 0) {
                leftRangeValue = 1 / 10 ** 6;
            }

            if (!isSorted) {
                leftRangeValue = 1 / leftRangeValue;
                rightRangeValue = 1 / rightRangeValue;
            }

            if ((!ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER] || mode === "handle" || mode === "reset") && leftRangeValue > 0) {
                onLeftRangeInput(leftRangeValue.toFixed(12));
            }

            if ((!ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER] || mode === "reset") && rightRangeValue > 0) {
                onRightRangeInput(rightRangeValue.toFixed(12));
            }
        },
        [isSorted, onLeftRangeInput, onRightRangeInput, ticksAtLimit]
    );

    const lowPrice = useMemo(
        () => (isSorted ? priceLower?.toSignificant(6) : priceUpper?.invert().toSignificant(6)),
        [isSorted, priceLower, priceUpper]
    );

    const highPrice = useMemo(
        () => (isSorted ? priceUpper?.toSignificant(6) : priceLower?.invert().toSignificant(6)),
        [isSorted, priceLower, priceUpper]
    );

    const brushDomain: [number, number] | undefined = useMemo(() => {
        return lowPrice && highPrice ? [parseFloat(lowPrice), parseFloat(highPrice)] : undefined;
    }, [highPrice, lowPrice]);

    const brushLabelValue = useCallback(
        (direction: "w" | "e", x: number) => {
            if (!currentPrice) return "";

            if (direction === "w" && ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]) return "0";
            if (direction === "e" && ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]) return "∞";

            const percent = (x < currentPrice ? -1 : 1) * ((Math.max(x, currentPrice) - Math.min(x, currentPrice)) / currentPrice) * 100;
            return `${Math.sign(percent) < 0 ? "-" : "+"}${formatDelta(percent)}%`;
        },
        [currentPrice, isSorted, ticksAtLimit]
    );

    const zoomLevels = useMemo(() => (isStable ? STABLE_ZOOM_LEVELS : DEFAULT_ZOOM_LEVELS), [isStable]);

    const fallbackPriceData = useMemo<PricePointV2[]>(() => {
        const base = currentPrice ?? 1;
        const end = Math.floor(Date.now() / 1000);
        return Array.from({ length: 24 }).map((_, index) => {
            const ratio = index / 24;
            const drift = 1 + Math.sin(index / 4) * 0.015;
            const value = base * (1 + (ratio - 0.5) * 0.02) * drift;
            const time = end - (24 - index) * 60 * 60;
            return {
                time,
                value,
                open: value,
                high: value,
                low: value,
                close: value,
            };
        });
    }, [currentPrice]);

    const mockData = useMemo(() => {
        if (!formattedData?.length && currentPrice) {
            return [
                {
                    activeLiquidity: 0,
                    price0: currentPrice * zoomLevels.initialMin,
                    price1: 1 / (currentPrice * zoomLevels.initialMin),
                    isCurrent: false,
                },
                {
                    activeLiquidity: 0,
                    price0: currentPrice * zoomLevels.initialMax,
                    price1: 1 / (currentPrice * zoomLevels.initialMax),
                    isCurrent: false,
                },
            ];
        }

        return [];
    }, [formattedData, currentPrice, zoomLevels.initialMin, zoomLevels.initialMax]);

    const mockPrice = useMemo(() => {
        if (!formattedData?.length && currentPrice) return currentPrice;
        return 0;
    }, [formattedData, currentPrice]);

    const v2LiquidityData = useMemo(() => {
        return (formattedData ?? mockData).map((item, index) => ({
            tick: index,
            price0: item.price0,
            activeLiquidity: item.activeLiquidity,
        }));
    }, [formattedData, mockData]);

    if (isChartLoading || !formattedData) {
        return <LiquidityChartLoader />;
    }

    if (useV2 && currentPrice) {
        const initialMinPrice = lowPrice ? parseFloat(lowPrice) : currentPrice * zoomLevels.initialMin;
        const initialMaxPrice = highPrice ? parseFloat(highPrice) : currentPrice * zoomLevels.initialMax;

        return (
            <div className="group relative mb-4 flex w-full" style={{ minHeight: "200px" }}>
                <LiquidityRangeChartV2
                    width={width}
                    height={height}
                    priceData={fallbackPriceData}
                    liquidityData={v2LiquidityData}
                    quoteSymbol={currencyB?.symbol}
                    baseSymbol={currencyA?.symbol}
                    currentPrice={currentPrice}
                    initialMinPrice={initialMinPrice}
                    initialMaxPrice={initialMaxPrice}
                    initialFullRange={Boolean(ticksAtLimit[Bound.LOWER] && ticksAtLimit[Bound.UPPER])}
                    onMinPriceChange={(nextPrice) => {
                        if (!onLeftRangeInput || typeof nextPrice !== "number" || nextPrice <= 0) return;
                        const adjusted = isSorted ? nextPrice : 1 / nextPrice;
                        onLeftRangeInput(adjusted.toFixed(12));
                    }}
                    onMaxPriceChange={(nextPrice) => {
                        if (!onRightRangeInput || typeof nextPrice !== "number" || nextPrice <= 0) return;
                        const adjusted = isSorted ? nextPrice : 1 / nextPrice;
                        onRightRangeInput(adjusted.toFixed(12));
                    }}
                    onInputModeChange={() => undefined}
                    onTimePeriodChange={() => undefined}
                    onFullRangeChange={() => undefined}
                />
            </div>
        );
    }

    return (
        <div className="group relative mb-4 flex w-full" style={{ minHeight: "200px" }}>
            <Chart
                data={{
                    series: formattedData?.length && currentPrice ? formattedData : mockData,
                    current: formattedData?.length && currentPrice ? currentPrice : mockPrice,
                }}
                dimensions={{ width, height }}
                margins={{ top: 50, right: 2, bottom: 20, left: 0 }}
                styles={{
                    main: {
                        primary: variant === "dark" ? "white" : "#121212",
                        secondary: variant === "dark" ? "#2B2B2B" : "#EAECE8",
                    },
                    area: {
                        selection: "var(--color-primary-200)",
                        current: "var(--color-accent-100)",
                    },
                    brush: {
                        handleStroke: variant === "dark" ? "var(--color-primary-200)" : "#121212",
                        handleAccent: variant === "dark" ? "var(--color-primary-200)" : "#121212",
                        handleBg: variant === "dark" ? "white" : "#EDEDED",
                    },
                    tooltip: {
                        primary: variant === "dark" ? "#2B2B2B" : "#FFFFFF",
                        bg: variant === "dark" ? "white" : "#2B2B2B",
                    },
                }}
                interactive={interactive}
                brushLabels={brushLabelValue}
                brushDomain={brushDomain}
                onBrushDomainChange={onBrushDomainChangeEnded}
                zoomLevels={zoomLevels}
                ticksAtLimit={ticksAtLimit}
                isMock={!formattedData?.length || !currentPrice}
                isOnlyView={isOnlyView}
                labelA={currencyA?.symbol ?? "Token A"}
                labelB={currencyB?.symbol ?? "Token B"}
            />
        </div>
    );
};

const LiquidityChartLoader = () => {
    const heights = [
        100, 110, 140, 110, 100, 140, 180, 120, 110, 100, 120, 100, 170, 170, 110, 100, 120, 100, 100, 110, 140, 110, 100, 140, 100,
        120, 100, 100, 110, 140, 110, 100, 140,
    ];

    return (
        <div className="flex h-[250px] w-full items-end gap-2 pb-4">
            {heights.map((barHeight, index) => (
                <Skeleton style={{ height: `${barHeight}px` }} key={index} className="w-[20px] bg-card-dark" />
            ))}
        </div>
    );
};

export default LiquidityChart;
