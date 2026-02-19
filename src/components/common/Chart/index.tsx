import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as LightWeightCharts from "lightweight-charts";
import { formatAmount } from "@/utils/common/formatAmount";
import { CHART_VIEW, POOL_CHART_TYPE, type IChart } from "@/types/swap-chart";
import { ChartSpanSelector } from "../ChartSpanSelector";
import { ChartTypeSelector } from "../ChartTypeSelector";
import Loader from "../Loader";
import { cn } from "@/utils";

const EMPTY_CANDLE_DATA: IChart["candleChartData"] = [];

export function Chart({
    chartData,
    candleChartData = EMPTY_CANDLE_DATA,
    chartView,
    chartTitle,
    chartSpan,
    setChartSpan,
    chartType,
    setChartType,
    showTypeSelector,
    height,
    tokenA,
    tokenB,
    isChartDataLoading,
    fadeOut,
}: IChart) {
    const chartRef = useRef<HTMLDivElement>(null);
    const [priceScaleMode, setPriceScaleMode] = useState<"normal" | "log" | "percent">("normal");

    const [chartCreated, setChart] = useState<LightWeightCharts.IChartApi | undefined>();
    const mainSeriesRef = useRef<LightWeightCharts.ISeriesApi<"Area" | "Histogram" | "Candlestick"> | undefined>();
    const previousChartDataRef = useRef(chartData);
    const previousCandleChartDataRef = useRef(candleChartData);
    const candleByTimeRef = useRef<Map<number, NonNullable<IChart["candleChartData"]>[number]>>(new Map());
    const isCandleView = chartView === CHART_VIEW.CANDLE;

    const chartCurrentValue = isCandleView
        ? previousCandleChartDataRef?.current?.length
            ? previousCandleChartDataRef.current[previousCandleChartDataRef.current.length - 1].close
            : 0
        : previousChartDataRef.current.length
          ? previousChartDataRef.current[previousChartDataRef.current.length - 1].value
          : 0;

    const [displayValue, setDisplayValued] = useState(chartCurrentValue);
    const [displayDate, setDisplayDate] = useState(new Date().toLocaleDateString());
    const [displayOhlc, setDisplayOhlc] = useState<{ open: number; high: number; low: number; close: number } | undefined>(undefined);
    const [displayVolume, setDisplayVolume] = useState<number>(0);

    const handleResize = useCallback(() => {
        if (chartCreated && chartRef?.current?.parentElement) {
            chartCreated.resize(isCandleView ? chartRef.current.offsetWidth : chartRef.current.offsetWidth - 32, chartRef.current.offsetHeight);
            chartCreated.timeScale().fitContent();
            chartCreated.timeScale().scrollToPosition(0, false);
        }
    }, [chartCreated, chartRef, isCandleView]);

    const crosshairMoveHandler = useCallback(
        (param: LightWeightCharts.MouseEventParams<LightWeightCharts.Time>) => {
            const { point, time, seriesData } = param;

            if (point && time && seriesData.size) {
                const data = mainSeriesRef.current ? seriesData.get(mainSeriesRef.current) : undefined;

                let value: number;
                if (data && "open" in data && "high" in data && "low" in data && "close" in data) {
                    value = data.close as number;
                    setDisplayOhlc({
                        open: data.open as number,
                        high: data.high as number,
                        low: data.low as number,
                        close: data.close as number,
                    });
                    const candle = candleByTimeRef.current.get(Number(time));
                    if (candle) {
                        setDisplayVolume(candle.volume);
                    }
                } else if (data && "value" in data) {
                    value = data.value as number;
                } else {
                    value = chartCurrentValue;
                }

                setDisplayValued(value);
                setDisplayDate(new Date(Number(time) * 1000).toLocaleDateString());
            } else {
                setDisplayValued(chartCurrentValue);
                setDisplayDate(new Date().toLocaleDateString());
                const latestCandle = previousCandleChartDataRef?.current?.[previousCandleChartDataRef.current.length - 1];
                if (latestCandle) {
                    setDisplayOhlc({
                        open: latestCandle.open,
                        high: latestCandle.high,
                        low: latestCandle.low,
                        close: latestCandle.close,
                    });
                    setDisplayVolume(latestCandle.volume);
                }
            }
        },
        [chartCurrentValue]
    );

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [chartRef, handleResize]);

    useLayoutEffect(() => {
        if (!chartRef.current || !previousChartDataRef.current) return;

        const effectiveData = [...(isChartDataLoading ? previousChartDataRef.current : chartData)].sort((a, b) => a.time - b.time);
        const effectiveCandleData = [...(isChartDataLoading && previousCandleChartDataRef.current ? previousCandleChartDataRef.current : (candleChartData || []))].sort(
            (a, b) => a.time - b.time
        );

        if (!isChartDataLoading) {
            previousChartDataRef.current = chartData;
            previousCandleChartDataRef.current = candleChartData;
        }

        if (chartRef.current.hasChildNodes()) chartRef.current.innerHTML = "";

        const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text-400").trim();

        const chart = LightWeightCharts.createChart(chartRef.current, {
            width: chartRef.current.parentElement?.clientWidth,
            height: chartRef.current.parentElement?.clientHeight || height,
            layout: {
                background: {
                    type: LightWeightCharts.ColorType.Solid,
                    color: "transparent",
                },
                textColor,
            },
            grid: {
                vertLines: {
                    color: isCandleView ? "rgba(96, 108, 128, 0.14)" : "transparent",
                },
                horzLines: {
                    color: isCandleView ? "rgba(96, 108, 128, 0.14)" : "transparent",
                },
            },
            crosshair: {
                mode: LightWeightCharts.CrosshairMode.Magnet,
                horzLine: {
                    visible: isCandleView,
                    style: isCandleView ? LightWeightCharts.LineStyle.LargeDashed : LightWeightCharts.LineStyle.Solid,
                    color: "rgba(171, 182, 201, 0.55)",
                },
                vertLine: {
                    style: LightWeightCharts.LineStyle.Solid,
                    color: isCandleView ? "rgba(171, 182, 201, 0.55)" : undefined,
                },
            },
            leftPriceScale: {
                visible: false,
            },
            rightPriceScale: {
                visible: isCandleView,
                borderColor: isCandleView ? textColor : "transparent",
                ticksVisible: isCandleView,
            },
            timeScale: {
                borderColor: textColor,
                timeVisible: true,
                secondsVisible: false,
            },
            handleScale: {
                mouseWheel: isCandleView,
            },
            handleScroll: {
                pressedMouseMove: isCandleView,
                vertTouchDrag: isCandleView,
                horzTouchDrag: isCandleView,
                mouseWheel: isCandleView,
            },
        });

        let series: LightWeightCharts.ISeriesApi<"Area" | "Histogram" | "Candlestick">;
        const primary200 = getComputedStyle(document.documentElement).getPropertyValue("--primary-200").trim();
        const successColor = "#11c5ae";
        const dangerColor = "#ff4d67";

        if (chartView === CHART_VIEW.CANDLE) {
            const priceMode =
                priceScaleMode === "log"
                    ? LightWeightCharts.PriceScaleMode.Logarithmic
                    : priceScaleMode === "percent"
                      ? LightWeightCharts.PriceScaleMode.Percentage
                      : LightWeightCharts.PriceScaleMode.Normal;

            series = chart.addCandlestickSeries({
                upColor: successColor,
                downColor: dangerColor,
                borderDownColor: dangerColor,
                borderUpColor: successColor,
                wickDownColor: dangerColor,
                wickUpColor: successColor,
                lastValueVisible: false,
                priceLineVisible: false,
                priceScaleId: "right",
                priceFormat: {
                    type: "custom",
                    formatter: (price: LightWeightCharts.BarPrice) =>
                        priceScaleMode === "percent"
                            ? `${price >= 0 ? "+" : ""}${formatAmount(price, 2)}%`
                            : formatAmount(price),
                },
            });

            const volumeSeries = chart.addHistogramSeries({
                priceScaleId: "volume",
                priceFormat: {
                    type: "volume",
                },
                lastValueVisible: false,
                priceLineVisible: false,
            });

            series.priceScale().applyOptions({
                mode: priceMode,
                scaleMargins: {
                    top: 0.04,
                    bottom: 0.22,
                },
            });
            volumeSeries.priceScale().applyOptions({
                scaleMargins: {
                    top: 0.83,
                    bottom: 0.02,
                },
            });

            series.setData(
                effectiveCandleData.map((v) => ({
                    time: v.time,
                    open: v.open,
                    high: v.high,
                    low: v.low,
                    close: v.close,
                }))
            );
            volumeSeries.setData(
                effectiveCandleData.map((v) => ({
                    time: v.time,
                    value: v.volume,
                    color: v.close >= v.open ? `${successColor}73` : `${dangerColor}73`,
                }))
            );
            candleByTimeRef.current = new Map(effectiveCandleData.map((v) => [Number(v.time), v]));
        } else if (chartView === CHART_VIEW.AREA || chartView === CHART_VIEW.LINE) {
            series = chart.addAreaSeries({
                topColor: `${primary200}9A`,
                bottomColor: `${primary200}00`,
                lineColor: primary200,
                lineWidth: 2,
                lastValueVisible: false,
                priceLineVisible: false,
                priceScaleId: "left",
                priceFormat: {
                    type: "custom",
                    formatter: (price: LightWeightCharts.BarPrice) => formatAmount(price),
                },
                autoscaleInfoProvider: () => ({
                    priceRange: {
                        minValue: chartView === CHART_VIEW.AREA ? 0 : Math.min(...effectiveData.map((v) => v.value)),
                        maxValue: Math.max(...effectiveData.map((v) => v.value)),
                    },
                }),
            });
        } else {
            series = chart.addHistogramSeries({
                color: `${primary200}CC`,
                base: 0,
                priceLineVisible: false,
                priceScaleId: "left",
                priceFormat: {
                    type: "custom",
                    formatter: (price: LightWeightCharts.BarPrice) => formatAmount(price),
                },
                autoscaleInfoProvider: () => ({
                    priceRange: {
                        minValue: 0,
                        maxValue: Math.max(...effectiveData.map((v) => v.value)),
                    },
                }),
            });
        }

        if (chartView !== CHART_VIEW.CANDLE) {
            series.setData(effectiveData);
        }

        chart.timeScale().fitContent();

        setChart(chart);
        mainSeriesRef.current = series;

        return () => {
            chart.remove();
        };
    }, [chartRef, chartData, candleChartData, chartView, isChartDataLoading, height, chartSpan, isCandleView, priceScaleMode]);

    useEffect(() => {
        if (!chartCreated) return undefined;

        chartCreated.subscribeCrosshairMove(crosshairMoveHandler);

        return () => chartCreated.unsubscribeCrosshairMove(crosshairMoveHandler);
    }, [chartCreated, crosshairMoveHandler]);

    useEffect(() => {
        setDisplayValued(chartCurrentValue);
        if (isCandleView) {
            const latestCandle = previousCandleChartDataRef?.current ? previousCandleChartDataRef.current[previousCandleChartDataRef.current.length - 1] : undefined;
            if (latestCandle) {
                setDisplayOhlc({
                    open: latestCandle.open,
                    high: latestCandle.high,
                    low: latestCandle.low,
                    close: latestCandle.close,
                });
                setDisplayVolume(latestCandle.volume);
            }
        }
    }, [chartCurrentValue, isCandleView]);

    const showLoader =
        ((!isCandleView && !previousChartDataRef.current.length && !chartData.length) ||
            (isCandleView && !previousCandleChartDataRef?.current?.length && !candleChartData?.length)) &&
        isChartDataLoading;
    const candleIsUp = displayOhlc ? displayOhlc.close >= displayOhlc.open : undefined;
    const ohlcColorClass = candleIsUp === undefined ? "text-text-300" : candleIsUp ? "text-emerald-400" : "text-rose-400";
    const percentChange = displayOhlc && displayOhlc.open !== 0 ? ((displayOhlc.close - displayOhlc.open) / displayOhlc.open) * 100 : 0;

    return (
        <>
            <div className="text-title flex flex-col-reverse items-start text-left lg:flex-row lg:justify-between px-4">
                <div>
                    <div className="mb-2 font-semibold">{chartTitle}</div>

                    <div className="mb-2 text-2xl font-semibold">
                        {displayValue !== undefined ? (
                            chartType === POOL_CHART_TYPE.PRICE ? (
                                tokenA && tokenB ? (
                                    `1 ${tokenA} = ${formatAmount(displayValue, 10)} ${tokenB}`
                                ) : (
                                    `$${formatAmount(displayValue)}`
                                )
                            ) : (
                                `$${formatAmount(displayValue)}`
                            )
                        ) : chartCurrentValue !== undefined ? (
                            `$${formatAmount(chartCurrentValue)}`
                        ) : (
                            <div className="min-h-[56px]">
                                <span className="inline-block h-[24px] w-[24px] animate-spin rounded-full border-2 border-solid border-white border-b-transparent" />
                            </div>
                        )}
                    </div>

                    <div className="mb-5 text-sm text-[#b7b7b7]">{displayValue !== undefined ? displayDate : null}</div>
                </div>

                <div className="mb-4 flex w-full items-center justify-center gap-2 md:mb-0 md:w-fit">
                    <ChartSpanSelector chartSpan={chartSpan} handleChangeChartSpan={setChartSpan} />
                    {showTypeSelector && <ChartTypeSelector chartType={chartType} handleChangeChartType={setChartType} />}
                </div>
            </div>
            {isCandleView ? (
                <div className="mx-4 mb-2 flex items-center justify-between text-sm">
                    <div className="text-text-300">
                        {displayOhlc && (
                            <div className="flex items-center gap-2">
                                <span className={ohlcColorClass}>O {formatAmount(displayOhlc.open, 6)}</span>
                                <span className={ohlcColorClass}>H {formatAmount(displayOhlc.high, 6)}</span>
                                <span className={ohlcColorClass}>L {formatAmount(displayOhlc.low, 6)}</span>
                                <span className={ohlcColorClass}>C {formatAmount(displayOhlc.close, 6)}</span>
                                <span className={ohlcColorClass}>{percentChange >= 0 ? "+" : ""}{formatAmount(percentChange, 2)}%</span>
                                <span className={ohlcColorClass}>Volume {formatAmount(displayVolume, 2)}</span>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
            <div className={cn("relative", fadeOut && "soft-div")}>
                {showLoader ? (
                    <div className="w-full h-full min-h-[180px] flex items-center justify-center">
                        <Loader className="w-10 h-10" />
                    </div>
                ) : (
                    <div
                        className={`transition-all duration-1000 ${isChartDataLoading ? "opacity-40 animate-pulse" : "opacity-100"}`}
                        style={{ height: `${height}px` }}
                        ref={chartRef}
                    />
                )}
            </div>
            {isCandleView ? (
                <div className="mt-2 flex items-center justify-end bg-card-dark/40 py-2 text-sm text-text-300">
                    <div className="flex items-center gap-2 border-r pr-2">
                        <button
                            type="button"
                            onClick={() => setPriceScaleMode("normal")}
                            className={cn(
                                "rounded-md px-2 py-1 transition-colors",
                                priceScaleMode === "normal" ? "bg-card-hover text-text-100" : "hover:bg-card-hover"
                            )}
                        >
                            auto
                        </button>
                        <button
                            type="button"
                            onClick={() => setPriceScaleMode("log")}
                            className={cn(
                                "rounded-md px-2 py-1 transition-colors",
                                priceScaleMode === "log" ? "bg-card-hover text-text-100" : "hover:bg-card-hover"
                            )}
                        >
                            log
                        </button>
                        <button
                            type="button"
                            onClick={() => setPriceScaleMode("percent")}
                            className={cn(
                                "rounded-md px-2 py-1 transition-colors",
                                priceScaleMode === "percent" ? "bg-card-hover text-text-100" : "hover:bg-card-hover"
                            )}
                        >
                            %
                        </button>
                    </div>
                    <div className="pl-2">{new Date().toLocaleTimeString()} UTC</div>
                </div>
            ) : null}
        </>
    );
}
