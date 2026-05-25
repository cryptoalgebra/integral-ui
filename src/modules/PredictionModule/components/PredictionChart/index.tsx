import { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from "react";
import * as LightWeightCharts from "lightweight-charts";
import { MarketFiveMinuteData } from "@/graphql/generated/graphql";
import { toLocalTimestamp } from "@/utils/common/formatDate";
import { PredictionMarket } from "../../types";

type MarketType = "lower" | "greater";

interface PredictionYesChartProps {
    lowerData: (Omit<MarketFiveMinuteData, "market"> & { market: PredictionMarket })[];
    greaterData: (Omit<MarketFiveMinuteData, "market"> & { market: PredictionMarket })[];
    currentMarket: MarketType;
    height?: number;
    loading?: boolean;
}

export function PredictionChart({ lowerData, greaterData, currentMarket, height = 260, loading }: PredictionYesChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<LightWeightCharts.IChartApi | null>(null);

    const [displayValue, setDisplayValue] = useState<number>(50);

    const rawData = currentMarket === "lower" ? lowerData : greaterData;

    const chartData = useMemo(() => {
        let _rawData: { time: number; value: number }[] = [];

        if (!rawData.length) {
            _rawData = [
                {
                    time: Math.ceil(Date.now() / 1000),
                    value: 50,
                },
            ];
        } else {
            const transformed = rawData.map((d) => ({
                time: d.date,
                value: Number(d.priceYes),
            }));

            _rawData = transformed.sort((a, b) => a.time - b.time);
        }

        const result: { time: number; value: number }[] = [];

        let prev = _rawData[0];

        const HOURS_BACK = 1;

        const startTime = prev.time - HOURS_BACK * 3600;

        for (let t = startTime; t < prev.time; t += 300) {
            result.push({
                time: t,
                value: 50,
            });
        }

        result.push(prev);

        for (let i = 1; i < _rawData.length; i++) {
            const current = _rawData[i];

            let t = prev.time + 300;

            while (t < current.time) {
                result.push({
                    time: t,
                    value: prev.value,
                });
                t += 300;
            }

            result.push(current);
            prev = current;
        }

        return result.map((d) => ({
            time: toLocalTimestamp(d.time) as LightWeightCharts.UTCTimestamp,
            value: d.value,
        }));
    }, [rawData]);

    const currentValue = chartData.length ? chartData[chartData.length - 1].value : 50;

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

        const textColor = getComputedStyle(document.documentElement)
            .getPropertyValue("--text-400")
            .trim();

        const chart = LightWeightCharts.createChart(chartRef.current, {
            width: chartRef.current.clientWidth,
            height,
            layout: {
                background: {
                    type: LightWeightCharts.ColorType.Solid,
                    color: "transparent",
                },
                textColor,
            },
            grid: {
                vertLines: { color: "transparent" },
                horzLines: { color: "transparent" },
            },
            rightPriceScale: {
                visible: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            leftPriceScale: { visible: false },
            timeScale: {
                borderColor: textColor,
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                mode: LightWeightCharts.CrosshairMode.Magnet,
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

        const series = chart.addLineSeries({
            color: "#16a34a",
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: false,
            priceFormat: {
                type: "custom",
                formatter: (price: number) => `${price.toFixed(2)}%`,
            },
            autoscaleInfoProvider: () => ({
                priceRange: {
                    minValue: 0,
                    maxValue: 100,
                },
            }),
        });

        series.setData(chartData);

        chart.timeScale().fitContent();

        const updateDotPosition = () => {
            if (!dotRef.current || !chartData.length) return;

            const last = chartData[chartData.length - 1];

            const x = chart.timeScale().timeToCoordinate(last.time);
            const y = series.priceToCoordinate(last.value);

            if (x === null || y === null) return;

            dotRef.current.style.left = `${x}px`;
            dotRef.current.style.top = `${y}px`;
        };

        updateDotPosition();

        chart.timeScale().subscribeVisibleTimeRangeChange(updateDotPosition);

        chart.subscribeCrosshairMove((param) => {
            if (!param.time || !param.seriesData.size) {
                setDisplayValue(currentValue);
                return;
            }

            const point = param.seriesData.values().next().value;

            if (point && "value" in point && point?.value !== undefined) {
                setDisplayValue(point.value);
            }
        });

        chartInstance.current = chart;

        return () => {
            chart.remove();
        };
    }, [chartData, height]);

    useEffect(() => {
        setDisplayValue(currentValue);
    }, [currentValue]);

    return (
        <>
            <div className="text-title flex flex-col items-start text-left px-4">
                <div className="mb-2 font-semibold text-left">Probability</div>

                <div className="text-xl font-semibold">
                    <div className="mb-2">{displayValue.toFixed(2)}% chance</div>
                    <div className="text-xs font-semibold uppercase text-green-600">Yes</div>
                </div>
            </div>

            <div className="relative">
                <div
                    className={`transition-all duration-500 ${loading ? "opacity-40 animate-pulse" : "opacity-100"}`}
                    ref={chartRef}
                    style={{ height }}
                />

                <div ref={dotRef} className="absolute z-2" style={{ transform: "translate(-50%, -50%)" }}>
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
                    </span>
                </div>
            </div>
        </>
    );
}
