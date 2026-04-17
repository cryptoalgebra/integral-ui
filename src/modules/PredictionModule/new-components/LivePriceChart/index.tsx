import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as LightWeightCharts from "lightweight-charts";
import { cn } from "@/utils";
import { ChevronsUp } from "lucide-react";

interface PricePoint {
    timestamp: number;
    price: number;
    isSwap?: boolean;
}

interface LivePriceChartProps {
    priceHistory: PricePoint[];
    targetPrice: number;
    currentPrice: number | undefined;
    height?: number;
}

const COLORS = {
    green: { line: "#22c55e", topGradient: "#22c55e30", bottomGradient: "#22c55e00" },
    red: { line: "#ef4444", topGradient: "#ef444430", bottomGradient: "#ef444400" },
    neutral: { line: "#ffffff", topGradient: "#ffffff30", bottomGradient: "#ffffff00" },
} as const;

export function LivePriceChart({ priceHistory, targetPrice, currentPrice, height = 200 }: LivePriceChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<LightWeightCharts.IChartApi | null>(null);
    const seriesRef = useRef<LightWeightCharts.ISeriesApi<"Area"> | null>(null);
    const targetLineRef = useRef<LightWeightCharts.IPriceLine | null>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);

    const [targetOutOfBounds, setTargetOutOfBounds] = useState<"above" | "below" | null>(null);

    const isAboveTarget = currentPrice !== undefined && currentPrice > targetPrice;

    const colorKey = currentPrice === undefined ? "neutral" : isAboveTarget ? "green" : "red";
    const chartColors = COLORS[colorKey];

    const handleResize = useCallback(() => {
        if (!chartInstance.current || !chartRef.current) return;
        chartInstance.current.resize(chartRef.current.offsetWidth, chartRef.current.offsetHeight);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    useLayoutEffect(() => {
        if (!chartRef.current) return;

        if (chartRef.current.hasChildNodes()) {
            chartRef.current.innerHTML = "";
        }

        const textColor = "rgba(255,255,255,0.4)";

        const chart = LightWeightCharts.createChart(chartRef.current, {
            width: chartRef.current.clientWidth,
            height,
            layout: {
                background: {
                    type: LightWeightCharts.ColorType.Solid,
                    color: "transparent",
                },
                textColor,
                fontFamily: "'Inter', system-ui, sans-serif",
            },
            grid: {
                vertLines: { color: "rgba(255,255,255,0.02)" },
                horzLines: { color: "rgba(255,255,255,0.02)" },
            },
            rightPriceScale: {
                visible: true,
                borderVisible: false,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.15,
                },
            },
            leftPriceScale: { visible: false },
            timeScale: {
                borderVisible: false,
                timeVisible: true,
                secondsVisible: true,
                rightOffset: 6,
                barSpacing: 12,
                minBarSpacing: 6,
            },
            crosshair: {
                mode: LightWeightCharts.CrosshairMode.Magnet,
                vertLine: {
                    color: "rgba(255,255,255,0.15)",
                    style: LightWeightCharts.LineStyle.Dashed,
                    width: 1,
                    labelVisible: false,
                },
                horzLine: {
                    color: "rgba(255,255,255,0.15)",
                    style: LightWeightCharts.LineStyle.Dashed,
                    width: 1,
                    labelVisible: true,
                },
            },
            handleScroll: {
                mouseWheel: false,
                pressedMouseMove: false,
            },
            handleScale: {
                mouseWheel: false,
                axisPressedMouseMove: false,
            },
        });

        // Start with neutral colors - will be updated dynamically
        const series = chart.addAreaSeries({
            lineColor: COLORS.neutral.line,
            topColor: COLORS.neutral.topGradient,
            bottomColor: COLORS.neutral.bottomGradient,
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: true,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 4,
            priceFormat: {
                type: "price",
                precision: 6,
                minMove: 0.000001,
            },
        });

        // Add target price line
        const targetLine = series.createPriceLine({
            price: targetPrice,
            color: "rgba(255,255,255,0.4)",
            lineWidth: 1,
            lineStyle: LightWeightCharts.LineStyle.Dashed,
            axisLabelVisible: true,
            title: "Target",
        });

        chartInstance.current = chart;
        seriesRef.current = series;
        targetLineRef.current = targetLine;

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
            chart.remove();
            chartInstance.current = null;
            seriesRef.current = null;
            targetLineRef.current = null;
        };
    }, [height, targetPrice]);

    useEffect(() => {
        if (!seriesRef.current) return;

        seriesRef.current.applyOptions({
            lineColor: chartColors.line,
            topColor: chartColors.topGradient,
            bottomColor: chartColors.bottomGradient,
        });
    }, [chartColors]);

    const updateDotPosition = useCallback(() => {
        if (!chartInstance.current || !seriesRef.current || !dotRef.current || priceHistory.length === 0) {
            return;
        }

        const last = priceHistory[priceHistory.length - 1];
        const x = chartInstance.current.timeScale().timeToCoordinate(last.timestamp as LightWeightCharts.UTCTimestamp);
        const y = seriesRef.current.priceToCoordinate(last.price);

        if (x !== null && y !== null) {
            dotRef.current.style.transform = `translate(${x - 6}px, ${y - 6}px)`;
            dotRef.current.style.opacity = "1";
        }
    }, [priceHistory]);

    useEffect(() => {
        if (!seriesRef.current || !priceHistory.length) return;

        const chartData = priceHistory.map((p) => ({
            time: p.timestamp as LightWeightCharts.UTCTimestamp,
            value: p.price,
        }));

        seriesRef.current.setData(chartData);

        const prices = priceHistory.map((p) => p.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice;
        const visibleMin = minPrice - priceRange * 0.15;
        const visibleMax = maxPrice + priceRange * 0.15;

        if (targetPrice > visibleMax) {
            setTargetOutOfBounds("above");
        } else if (targetPrice < visibleMin) {
            setTargetOutOfBounds("below");
        } else {
            setTargetOutOfBounds(null);
        }

        // Scroll to latest
        if (chartInstance.current) {
            chartInstance.current.timeScale().scrollToRealTime();
        }

        // Update dot position after data update
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(updateDotPosition);
    }, [priceHistory, targetPrice, updateDotPosition]);

    useEffect(() => {
        const updateLoop = () => {
            updateDotPosition();
            rafRef.current = requestAnimationFrame(updateLoop);
        };

        rafRef.current = requestAnimationFrame(updateLoop);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [updateDotPosition]);

    useEffect(() => {
        if (!targetLineRef.current) return;
        targetLineRef.current.applyOptions({ price: targetPrice });
    }, [targetPrice]);

    return (
        <div className="relative w-full">
            <div ref={dotRef} className="absolute z-10 pointer-events-none left-0 top-0 opacity-0 transition-opacity duration-150">
                <span className="relative flex h-3 w-3">
                    <span
                        className={cn(
                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                            isAboveTarget ? "bg-green-500" : "bg-red-500",
                        )}
                    />
                    <span className={cn("relative inline-flex rounded-full h-3 w-3", isAboveTarget ? "bg-green-500" : "bg-red-500")} />
                </span>
            </div>

            <div className={cn("absolute left-2 z-10", targetOutOfBounds === "below" ? "bottom-9" : "top-2")}>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 backdrop-blur-sm border border-white/10">
                    {targetOutOfBounds ? (
                        <>
                            <ChevronsUp className={cn("w-4 h-4 animate-pulse", targetOutOfBounds === "below" && "rotate-180")} />
                            <span className={cn("text-[10px] uppercase tracking-wide animate-pulse")}>Target {targetOutOfBounds}</span>
                        </>
                    ) : (
                        <>
                            <div className="w-4 h-px bg-text border" style={{ borderStyle: "dashed" }} />
                            <span className="text-[10px] uppercase tracking-wide">Target</span>
                        </>
                    )}
                </div>
            </div>

            <div ref={chartRef} style={{ height }} className="w-full" />
        </div>
    );
}
