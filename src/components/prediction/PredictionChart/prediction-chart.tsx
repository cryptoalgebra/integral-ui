import { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from "react";
import * as LightWeightCharts from "lightweight-charts";
import { cn } from "@/utils";
import { MarketFiveMinuteData } from "@/graphql/generated/graphql";
import { PredictionMarket } from "@/types/prediction";
import { Pool } from "@cryptoalgebra/integral-sdk";
import { formatUnits } from "viem";
import LiveChip from "../LiveChip";
import { Link } from "react-router-dom";
import { toLocalTimestamp } from "@/utils/common/formatDate";

type MarketType = "lower" | "greater";

interface PredictionYesChartProps {
    pool: Pool | undefined | null;
    lowerMarket: PredictionMarket | undefined;
    greaterMarket: PredictionMarket | undefined;
    lowerData: (Omit<MarketFiveMinuteData, "market"> & { market: PredictionMarket })[];
    greaterData: (Omit<MarketFiveMinuteData, "market"> & { market: PredictionMarket })[];
    currentMarket: MarketType;
    changeMarket: (type: MarketType) => void;
    showOverlay?: boolean;
    height?: number;
    loading?: boolean;
}

export function PredictionChart({
    pool,
    lowerMarket,
    greaterMarket,
    lowerData,
    greaterData,
    currentMarket,
    height = 260,
    showOverlay = false,
    loading,
}: PredictionYesChartProps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const dotRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<LightWeightCharts.IChartApi | null>(null);

    const [displayValue, setDisplayValue] = useState<number>(50);

    const rawData = currentMarket === "lower" ? lowerData : greaterData;

    const market = currentMarket === "lower" ? lowerMarket : greaterMarket;

    const marketCurrency = market?.marketToken === 0 ? pool?.token0 : pool?.token1;
    const quoteCurrency = market?.marketToken === 0 ? pool?.token1 : pool?.token0;

    const formattedCondition = quoteCurrency
        ? formatUnits(BigInt(market?.mark || 0), quoteCurrency.decimals).split(".")[0]
        : 0;

    const isGreater = market?.condition === "greater";

    const chartData = useMemo(() => {

        let _rawData: { time: number, value: number }[] = []

        if (!rawData.length) {
            _rawData = [{
                time: Math.ceil(Date.now() / 1000),
                value: 50
            }]
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

    const currentValue = chartData.length
        ? chartData[chartData.length - 1].value
        : 50;

    const handleResize = useCallback(() => {
        if (!chartInstance.current || !chartRef.current) return;

        chartInstance.current.resize(
            chartRef.current.offsetWidth,
            chartRef.current.offsetHeight
        );
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
                axisPressedMouseMove: false
            },
        });

        const series = chart.addLineSeries({
            color: "#7ccf00",
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
                    maxValue: 100
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
        <div className="px-4">

            { showOverlay && <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-3">

                {
                    market ? <div className="flex items-center justify-start gap-4">
                        <Link to={`/prediction/${market.id}`} className="text-base md:text-xl font-semibold hover:underline">
                            Will {marketCurrency?.symbol === "WETH" ? "ETH" : marketCurrency?.symbol} be{" "}
                            <span
                                className={cn(
                                    isGreater ? "text-green-400" : "text-red-400"
                                )}
                            >
                                {market.condition}
                            </span>{" "}
                            than {formattedCondition} {quoteCurrency?.symbol}?
                        </Link>
                        <LiveChip />
                    </div> : <div/>
                }

                {/* <div className="flex items-center gap-1 rounded-xl bg-card-dark border border-card-border p-1">
                    <Button
                        size={"sm"}
                        onClick={() => changeMarket("greater")}
                        variant={"icon"}
                        disabled={market?.condition === "greater"}
                        className={cn(
                            "gap-1 border rounded-xl disabled:opacity-100 hover:bg-text-100/5",
                            market?.condition === "greater" ? "bg-text-100/5 border-text-100/20" : "border-none"
                        )}
                    >
                        <ArrowUp size={16} className="text-green-400" />
                        Greater
                    </Button>
                    <Button
                        size={"sm"}
                        onClick={() => changeMarket("lower")}
                        variant={"icon"}
                        disabled={market?.condition === "lower"}
                        className={cn(
                            "gap-1 border rounded-xl disabled:opacity-100 hover:bg-text-100/5",
                            market?.condition === "lower" ? "bg-text-100/5 border-text-100/20" : "border-none"
                        )}
                    >
                        <ArrowDown size={16} className="text-red-400" />
                        Lower
                    </Button>
                </div> */}
            </div> }

            <div className="text-left text-lg">
                <div className="text-xs font-semibold uppercase text-lime-500">Yes</div>
                <div>{displayValue.toFixed(2)}% chance</div>
            </div>

            <div className="relative">
                <div 
                    className={`transition-all duration-500 ${
                        loading ? "opacity-40 animate-pulse" : "opacity-100" }`} 
                    ref={chartRef} 
                    style={{ height }} 
                />

                <div
                    ref={dotRef}
                    className="absolute z-2"
                    style={{ transform: "translate(-50%, -50%)" }}
                >
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-500"></span>
                    </span>
                </div>
            </div>

        </div>
    );
}