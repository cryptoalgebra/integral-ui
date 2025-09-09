import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as LightWeightCharts from "lightweight-charts";
import { formatAmount } from "@/utils/common/formatAmount";
import { CHART_VIEW, POOL_CHART_TYPE, type IChart } from "@/types/swap-chart";
import { ChartSpanSelector } from "../ChartSpanSelector";
import { ChartTypeSelector } from "../ChartTypeSelector";
import Loader from "../Loader";
import { cn } from "@/utils";
// import { bucketChartData } from "@/utils/chart/bucketChartData";

export function Chart({
    chartData,
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
    fadeOut
}: IChart) {
    const chartRef = useRef<HTMLDivElement>(null);

    const [series, setSeries] = useState<LightWeightCharts.ISeriesApi<"Line" | "Area" | "Histogram"> | undefined>();
    const [chartCreated, setChart] = useState<LightWeightCharts.IChartApi | undefined>();
    const previousChartDataRef = useRef(chartData);

    const chartCurrentValue = previousChartDataRef.current.length
        ? previousChartDataRef.current[previousChartDataRef.current.length - 1].value
        : 0;

    const [displayValue, setDisplayValued] = useState(chartCurrentValue);
    const [displayDate, setDisplayDate] = useState(new Date().toLocaleDateString());

    const handleResize = useCallback(() => {
        if (chartCreated && chartRef?.current?.parentElement) {
            chartCreated.resize(chartRef.current.offsetWidth - 32, chartRef.current.offsetHeight);
            chartCreated.timeScale().fitContent();
            chartCreated.timeScale().scrollToPosition(0, false);
        }
    }, [chartCreated, chartRef]);

    const crosshairMoveHandler = useCallback(
        (param: LightWeightCharts.MouseEventParams<LightWeightCharts.Time>) => {
            const { point, time, seriesData } = param;

            if (point && time && seriesData.size) {
                const data = seriesData.values().next().value;

                let value;
                if (data && "value" in data) {
                    value = data.value; // For LineData or HistogramData
                } else {
                    value = chartCurrentValue; // Default fallback
                }

                setDisplayValued(value);
                setDisplayDate(new Date(Number(time) * 1000).toLocaleDateString());
            } else {
                setDisplayValued(chartCurrentValue);
                setDisplayDate(new Date().toLocaleDateString());
            }
        },
        [chartCurrentValue]
    );

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [chartRef, handleResize]);

    useEffect(() => {
        if (!chartData && chartCreated && series) {
            chartCreated.remove();
            chartCreated.unsubscribeCrosshairMove(crosshairMoveHandler);
        }
    }, [chartData, chartCreated, series, crosshairMoveHandler]);

    useLayoutEffect(() => {
        if (!chartRef.current || !previousChartDataRef.current) return;

        const effectiveData = isChartDataLoading ? previousChartDataRef.current : chartData;

        effectiveData.sort((a, b) => a.time - b.time);

        if (!isChartDataLoading) {
            previousChartDataRef.current = chartData;
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
                    color: "transparent",
                },
                horzLines: {
                    color: "transparent",
                },
            },
            crosshair: {
                mode: LightWeightCharts.CrosshairMode.Magnet,
                horzLine: {
                    visible: false,
                },
                vertLine: {
                    style: LightWeightCharts.LineStyle.Solid,
                },
            },
            leftPriceScale: {
                visible: false,
            },
            rightPriceScale: {
                visible: false,
            },
            timeScale: {
                // borderVisible: false,
                borderColor: textColor,
                timeVisible: true,
            },
            handleScale: {
                mouseWheel: false,
            },
            handleScroll: {
                pressedMouseMove: false,
                vertTouchDrag: false,
                horzTouchDrag: false,
                mouseWheel: false,
            },
        });

        let series;
        const primary200 = getComputedStyle(document.documentElement).getPropertyValue("--primary-200").trim();

        if (chartView === CHART_VIEW.AREA || chartView === CHART_VIEW.LINE) {
            series = chart?.addAreaSeries({
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
            series = chart?.addHistogramSeries({
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

        // const bucketSize = chartSpan === CHART_SPAN.WEEK ? 3600 : chartSpan === CHART_SPAN.DAY ? 600 : 3600 * 24;

        // const bucketedData = bucketChartData(effectiveData, bucketSize);

        series.setData(effectiveData);

        chart.timeScale().fitContent();

        setChart(chart);
        setSeries(series);
    }, [chartRef, chartData, chartView, isChartDataLoading, height, chartSpan]);

    useEffect(() => {
        if (!chartCreated) return undefined;

        chartCreated.subscribeCrosshairMove(crosshairMoveHandler);

        return () => chartCreated.unsubscribeCrosshairMove(crosshairMoveHandler);
    }, [chartCreated, crosshairMoveHandler]);

    useEffect(() => {
        setDisplayValued(chartCurrentValue);
    }, [chartCurrentValue]);

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
            <div className={cn('relative', fadeOut && 'soft-div' )}>
                {!previousChartDataRef.current.length && !chartData.length && isChartDataLoading ? (
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
                {/* {!chartData?.length ? (
                    <div className="absolute top-0 flex h-full w-full items-center justify-center">
                        <span className="h-[24px] w-[24px] animate-spin rounded-full border-2 border-solid border-white border-b-transparent" />
                    </div>
                ) : null} */}
            </div>
        </>
    );
}
