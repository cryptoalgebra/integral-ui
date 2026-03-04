import { useEffect, useMemo, useRef, useState } from "react";
import NarrowPresetSvg from "@/assets/range-presets/narrow.svg";
import CommonPresetSvg from "@/assets/range-presets/common.svg";
import WidePresetSvg from "@/assets/range-presets/wide.svg";
import OneSidedLowerPresetSvg from "@/assets/range-presets/one-sided-lower.svg";
import OneSidedUpperPresetSvg from "@/assets/range-presets/one-sided-upper.svg";
import FullPresetSvg from "@/assets/range-presets/full.svg";
import { boundPanY, calculateDynamicZoomMin } from "./chartMathV2";
import { ChartCanvasV2 } from "./ChartCanvasV2";
import { useLiquidityRangeChartModel } from "./useLiquidityRangeChartModel";
import { LiquidityPointV2, LiquidityRangeChartV2Props, TimePeriodV2 } from "./typesV2";

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 220;

const TIME_PERIODS: TimePeriodV2[] = ["1D", "1W", "1M", "1Y"];
type PresetCardId = "narrow" | "common" | "wide" | "one-sided-lower" | "one-sided-upper" | "full-range";
const STABLE_SYMBOLS = new Set(["USDC", "USDT", "DAI", "USDBC", "USDE", "FRAX", "LUSD", "TUSD"]);
const STABLE_ADDRESSES = new Set([
    "0xabac6f23fdf1313fc2e9c9244f666157ccd32990",
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    "0xdac17f958d2ee523a2206206994597c13d831ec7",
    "0x6b175474e89094c44da98b954eedeac495271d0f",
]);

const PRESET_CARDS: { id: PresetCardId; label: string; description: string; icon: string }[] = [
    { id: "narrow", label: "Narrow", description: "Tight range around current price.", icon: NarrowPresetSvg },
    { id: "common", label: "Common", description: "Balanced range for typical volatility.", icon: CommonPresetSvg },
    { id: "wide", label: "Wide", description: "Broader range with fewer adjustments.", icon: WidePresetSvg },
    { id: "one-sided-lower", label: "One sided lower", description: "Range mostly below current price.", icon: OneSidedLowerPresetSvg },
    { id: "one-sided-upper", label: "One sided upper", description: "Range mostly above current price.", icon: OneSidedUpperPresetSvg },
    { id: "full-range", label: "Full range", description: "Maximum coverage across entire pool.", icon: FullPresetSvg },
];

function periodToSeconds(period: TimePeriodV2) {
    switch (period) {
        case "1D":
            return 24 * 60 * 60;
        case "1W":
            return 7 * 24 * 60 * 60;
        case "1M":
            return 30 * 24 * 60 * 60;
        case "1Y":
            return 365 * 24 * 60 * 60;
        default:
            return 30 * 24 * 60 * 60;
    }
}

function normalizeLiquidityData(data: LiquidityPointV2[]) {
    return [...data]
        .filter((item) => Number.isFinite(item.price0) && Number.isFinite(item.activeLiquidity))
        .sort((a, b) => a.price0 - b.price0);
}

function parseInputToPrice(input: string, currentPrice: number, isPercentageMode: boolean) {
    const nextValue = Number(input);
    if (!Number.isFinite(nextValue)) {
        return undefined;
    }

    if (!isPercentageMode) {
        return nextValue;
    }

    return currentPrice * (1 + nextValue / 100);
}

function displayPrice(value: number, currentPrice: number, isPercentageMode: boolean) {
    if (!isPercentageMode) {
        return value.toFixed(6);
    }

    const pct = ((value - currentPrice) / currentPrice) * 100;
    return pct.toFixed(2);
}

function getPresetRangeById(preset: PresetCardId, current: number, isStablePair: boolean) {
    if (preset === "narrow") {
        return isStablePair ? { min: current * 0.995, max: current * 1.005 } : { min: current * 0.95, max: current * 1.1 };
    }
    if (preset === "common") {
        return isStablePair ? { min: current * 0.99, max: current * 1.01 } : { min: current * 0.9, max: current * 1.2 };
    }
    if (preset === "wide") {
        return isStablePair ? { min: current * 0.98, max: current * 1.02 } : { min: current * 0.8, max: current * 1.4 };
    }
    return undefined;
}

export function LiquidityRangeChartV2({
    priceData,
    liquidityData,
    quoteSymbol,
    currentPrice,
    baseSymbol,
    baseTokenAddress,
    quoteTokenAddress,
    initialMinPrice,
    initialMaxPrice,
    initialInputMode,
    initialTimePeriod,
    initialFullRange,
    width,
    height,
    useFullRangePreset = true,
    disableRangeEditing = false,
    onMinPriceChange,
    onMaxPriceChange,
    onInputModeChange,
    onTimePeriodChange,
    onFullRangeChange,
}: LiquidityRangeChartV2Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<PresetCardId | null>(null);
    const sortedLiquidityData = useMemo(() => normalizeLiquidityData(liquidityData), [liquidityData]);

    const fallbackCurrent = sortedLiquidityData[Math.floor(sortedLiquidityData.length / 2)]?.price0 ?? 1;
    const resolvedCurrentPrice = currentPrice ?? fallbackCurrent;

    const model = useLiquidityRangeChartModel({
        liquidityData: sortedLiquidityData,
        currentPrice: resolvedCurrentPrice,
        initialMinPrice,
        initialMaxPrice,
        initialFullRange,
        initialInputMode,
        initialTimePeriod,
        initialWidth: width ?? DEFAULT_WIDTH,
        initialHeight: height ?? DEFAULT_HEIGHT,
        onMinPriceChange,
        onMaxPriceChange,
        onInputModeChange,
        onTimePeriodChange,
        onFullRangeChange,
    });

    const { state, dispatch, commands } = model;
    const isStablePair = useMemo(() => {
        const baseBySymbol = Boolean(baseSymbol && STABLE_SYMBOLS.has(baseSymbol.toUpperCase()));
        const quoteBySymbol = Boolean(quoteSymbol && STABLE_SYMBOLS.has(quoteSymbol.toUpperCase()));
        const baseByAddress = Boolean(baseTokenAddress && STABLE_ADDRESSES.has(baseTokenAddress.toLowerCase()));
        const quoteByAddress = Boolean(quoteTokenAddress && STABLE_ADDRESSES.has(quoteTokenAddress.toLowerCase()));
        return (baseBySymbol || baseByAddress) && (quoteBySymbol || quoteByAddress);
    }, [baseSymbol, baseTokenAddress, quoteSymbol, quoteTokenAddress]);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const target = containerRef.current;
        const observer = new ResizeObserver((entries) => {
            const rect = entries[0]?.contentRect;
            if (!rect) {
                return;
            }

            const nextWidth = width ?? Math.max(320, rect.width);
            const nextHeight = height ?? DEFAULT_HEIGHT;
            dispatch({ type: "SET_DIMENSIONS", payload: { width: nextWidth, height: nextHeight } });

            const dynamicZoomMin = calculateDynamicZoomMin(sortedLiquidityData.length, nextHeight);
            dispatch({
                type: "SET_VIEWPORT",
                payload: {
                    dynamicZoomMin,
                    zoom: Math.max(dynamicZoomMin, state.viewport.zoom),
                    panY: boundPanY({
                        panY: state.viewport.panY,
                        viewportHeight: nextHeight,
                        liquidityLength: sortedLiquidityData.length,
                        zoom: Math.max(dynamicZoomMin, state.viewport.zoom),
                    }),
                },
            });
        });

        observer.observe(target);
        return () => observer.disconnect();
    }, [dispatch, height, sortedLiquidityData.length, state.viewport.panY, state.viewport.zoom, width]);

    const filteredPriceData = useMemo(() => {
        if (priceData.length <= 1) {
            return priceData;
        }

        const now = priceData[priceData.length - 1]?.time ?? Math.floor(Date.now() / 1000);
        const windowSeconds = periodToSeconds(state.ui.selectedHistoryDuration);
        const from = now - windowSeconds;
        return priceData.filter((point) => point.time >= from);
    }, [priceData, state.ui.selectedHistoryDuration]);

    const isPercentageMode = state.ui.inputMode === "percentage";
    const [minInputValue, setMinInputValue] = useState("");
    const [maxInputValue, setMaxInputValue] = useState("");
    const [isMinInputEditing, setIsMinInputEditing] = useState(false);
    const [isMaxInputEditing, setIsMaxInputEditing] = useState(false);

    useEffect(() => {
        if (!isMinInputEditing) {
            setMinInputValue(displayPrice(state.range.minPrice, resolvedCurrentPrice, isPercentageMode));
        }
    }, [isMinInputEditing, isPercentageMode, resolvedCurrentPrice, state.range.minPrice]);

    useEffect(() => {
        if (!isMaxInputEditing) {
            setMaxInputValue(displayPrice(state.range.maxPrice, resolvedCurrentPrice, isPercentageMode));
        }
    }, [isMaxInputEditing, isPercentageMode, resolvedCurrentPrice, state.range.maxPrice]);

    const handleMinInputChange = (value: string) => {
        setMinInputValue(value);
        if (disableRangeEditing) return;

        const normalizedValue = value.replace(",", ".");
        if (!normalizedValue.trim()) return;

        const parsed = parseInputToPrice(normalizedValue, resolvedCurrentPrice, isPercentageMode);
        if (typeof parsed === "number") {
            commands.setRange({ minPrice: parsed }, true);
        }
    };

    const handleMaxInputChange = (value: string) => {
        setMaxInputValue(value);
        if (disableRangeEditing) return;

        const normalizedValue = value.replace(",", ".");
        if (!normalizedValue.trim()) return;

        const parsed = parseInputToPrice(normalizedValue, resolvedCurrentPrice, isPercentageMode);
        if (typeof parsed === "number") {
            commands.setRange({ maxPrice: parsed }, true);
        }
    };

    const handleMinInputBlur = () => {
        setIsMinInputEditing(false);
        setMinInputValue(displayPrice(state.range.minPrice, resolvedCurrentPrice, isPercentageMode));
    };

    const handleMaxInputBlur = () => {
        setIsMaxInputEditing(false);
        setMaxInputValue(displayPrice(state.range.maxPrice, resolvedCurrentPrice, isPercentageMode));
    };

    if (sortedLiquidityData.length === 0) {
        return (
            <div className="rounded-xl border border-white/10 bg-card p-4 text-sm text-white/70">
                Not enough liquidity data to render chart.
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-3" ref={containerRef}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className="rounded-lg bg-background/60 p-3">
                    <div className="text-xs text-foreground/60">Min price ({quoteSymbol ?? "quote"})</div>
                    <input
                        className="mt-1 h-auto border-none bg-transparent p-0 text-left text-lg font-bold ring-0! focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={minInputValue}
                        disabled={state.range.isFullRange || disableRangeEditing}
                        onFocus={() => setIsMinInputEditing(true)}
                        onBlur={handleMinInputBlur}
                        onChange={(event) => handleMinInputChange(event.target.value)}
                        inputMode="decimal"
                        spellCheck={false}
                        autoComplete="off"
                    />
                </label>
                <label className="rounded-lg bg-background/60 p-3">
                    <div className="text-xs text-foreground/60">Max price ({quoteSymbol ?? "quote"})</div>
                    <input
                        className="mt-1 h-auto border-none bg-transparent p-0 text-left text-lg font-bold ring-0! focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={maxInputValue}
                        disabled={state.range.isFullRange || disableRangeEditing}
                        onFocus={() => setIsMaxInputEditing(true)}
                        onBlur={handleMaxInputBlur}
                        onChange={(event) => handleMaxInputChange(event.target.value)}
                        inputMode="decimal"
                        spellCheck={false}
                        autoComplete="off"
                    />
                </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {TIME_PERIODS.map((period) => (
                    <button
                        key={period}
                        type="button"
                        className={`rounded-md px-2 py-1 text-xs ${
                            state.ui.selectedHistoryDuration === period ? "bg-primary text-white" : "bg-card-dark text-white/70"
                        }`}
                        onClick={() => commands.setTimePeriod(period)}
                    >
                        {period}
                    </button>
                ))}

                <div className="ml-auto flex items-center gap-1">
                    <button type="button" className="rounded-md bg-card-dark px-2 py-1 text-xs" onClick={() => commands.zoom("in")}>
                        +
                    </button>
                    <button type="button" className="rounded-md bg-card-dark px-2 py-1 text-xs" onClick={() => commands.center()}>
                        Center
                    </button>
                    <button type="button" className="rounded-md bg-card-dark px-2 py-1 text-xs" onClick={() => commands.zoom("out")}>
                        -
                    </button>
                    <button type="button" className="rounded-md bg-card-dark px-2 py-1 text-xs" onClick={() => commands.reset()}>
                        Reset
                    </button>
                </div>
            </div>

            <div>
                <ChartCanvasV2
                    priceData={filteredPriceData}
                    liquidityData={sortedLiquidityData}
                    state={state}
                    commands={commands}
                    quoteSymbol={quoteSymbol}
                    rangeEditable={!disableRangeEditing}
                />
            </div>

            {!disableRangeEditing && (
                <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
                    {PRESET_CARDS.filter((preset) => (useFullRangePreset ? true : preset.id !== "full-range")).map((preset) => (
                        <button
                            key={preset.id}
                            type="button"
                            className={`snap-start shrink-0 flex h-32 w-[168px] flex-col items-center justify-center gap-2 rounded-md border px-3 py-3 text-xs ${
                                selectedPreset === preset.id ? "border-primary bg-primary/10 text-white" : "border-card-border bg-card-dark text-white/80"
                            }`}
                            onClick={() => {
                                setSelectedPreset(preset.id);
                                if (preset.id === "one-sided-lower") {
                                    commands.setStrategy("one-sided-lower");
                                    return;
                                }
                                if (preset.id === "one-sided-upper") {
                                    commands.setStrategy("one-sided-upper");
                                    return;
                                }
                                if (preset.id === "full-range") {
                                    commands.setStrategy("full-range");
                                    return;
                                }
                                if (preset.id === "wide") {
                                    const range = getPresetRangeById("wide", resolvedCurrentPrice, isStablePair);
                                    if (range) {
                                        commands.setRange({ minPrice: range.min, maxPrice: range.max, isFullRange: false }, true, true);
                                    }
                                    return;
                                }

                                if (preset.id === "narrow" || preset.id === "common") {
                                    const range = getPresetRangeById(preset.id, resolvedCurrentPrice, isStablePair);
                                    if (range) {
                                        commands.setRange({ minPrice: range.min, maxPrice: range.max, isFullRange: false }, true, true);
                                    }
                                }
                            }}
                        >
                            <span className="font-medium">{preset.label}</span>
                            <img src={preset.icon} alt={preset.label} className="h-[46px] w-[96px] object-contain" />
                            <span className="text-[10px] text-center text-white/65">{preset.description}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
