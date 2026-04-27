import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import * as LightWeightCharts from "lightweight-charts";
import { formatAmount } from "@/utils/common/formatAmount";
import { CHART_VIEW, POOL_CHART_TYPE, IChart } from "@/types/swap-chart";
import { ChartSpanSelector } from "../ChartSpanSelector";
import { ChartTypeSelector } from "../ChartTypeSelector";
import Loader from "../Loader";
import { cn, UNIX_TIMESTAMPS } from "@/utils";
import { bucketChartData } from "@/utils/chart/bucketChartData";

const SPARSE_DATA_THRESHOLD = 4;
const TOOLTIP_WIDTH = 168;
const TOOLTIP_HEIGHT = 64;
const TOOLTIP_OFFSET = 14;

interface TooltipState {
    left: number;
    top: number;
    value: number;
    timestamp: string;
}

function withOpacity(color: string, opacity: number) {
    const normalizedColor = color.trim().toLowerCase();

    if (!normalizedColor) return `rgba(0, 0, 0, ${opacity})`;

    if (normalizedColor === "white") return `rgba(255, 255, 255, ${opacity})`;
    if (normalizedColor === "black") return `rgba(0, 0, 0, ${opacity})`;

    if (normalizedColor.startsWith("#")) {
        let hex = normalizedColor.slice(1);

        if (hex.length === 3) {
            hex = hex
                .split("")
                .map((character) => `${character}${character}`)
                .join("");
        }

        if (hex.length === 6) {
            const red = Number.parseInt(hex.slice(0, 2), 16);
            const green = Number.parseInt(hex.slice(2, 4), 16);
            const blue = Number.parseInt(hex.slice(4, 6), 16);

            return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
        }
    }

    if (normalizedColor.startsWith("rgb(")) {
        return normalizedColor.replace("rgb(", "rgba(").replace(")", `, ${opacity})`);
    }

    return color;
}

function getSortedChartData(data: IChart["chartData"]) {
    return [...data]
        .filter((point) => Number.isFinite(point.value) && Number.isFinite(Number(point.time)))
        .sort((left, right) => Number(left.time) - Number(right.time));
}

function getSparsePaddingSeconds(chartSpan: IChart["chartSpan"], dataLength: number, range: number) {
    const spanPadding = Math.max(Math.floor(UNIX_TIMESTAMPS[chartSpan] / 8), 60 * 60);

    if (dataLength <= 1) return spanPadding;

    return Math.max(Math.floor(range * 0.6), spanPadding);
}

function getDisplayChartData(data: IChart["chartData"], chartView: IChart["chartView"], chartSpan: IChart["chartSpan"]) {
    const sortedData = getSortedChartData(data);

    if (!sortedData.length || chartView === CHART_VIEW.BAR || sortedData.length > 1) {
        return sortedData;
    }

    const point = sortedData[0];
    const padding = getSparsePaddingSeconds(chartSpan, sortedData.length, 0);

    return [
        {
            time: Math.max(0, Number(point.time) - padding) as LightWeightCharts.UTCTimestamp,
            value: point.value,
        },
        point,
        {
            time: (Number(point.time) + padding) as LightWeightCharts.UTCTimestamp,
            value: point.value,
        },
    ];
}

function getSparseBucketSize(chartSpan: IChart["chartSpan"]) {
    switch (chartSpan) {
        case "1":
            return 60 * 60;
        case "7":
            return 60 * 60 * 6;
        case "30":
            return 60 * 60 * 24;
        case "90":
            return 60 * 60 * 24 * 3;
        case "365":
            return 60 * 60 * 24 * 7;
        default:
            return 60 * 60 * 24;
    }
}

function getSparseRange(chartSpan: IChart["chartSpan"], data: IChart["chartData"]) {
    const sortedData = getSortedChartData(data);

    if (!sortedData.length) return null;

    const now = Math.floor(Date.now() / 1000);
    const end = Math.max(now, Number(sortedData[sortedData.length - 1].time));
    const start = Math.max(0, end - UNIX_TIMESTAMPS[chartSpan]);

    return { start, end };
}

function getSparseDisplayData(data: IChart["chartData"], chartView: IChart["chartView"], chartSpan: IChart["chartSpan"]) {
    const sortedData = getSortedChartData(data);

    if (!sortedData.length || chartView === CHART_VIEW.BAR || sortedData.length > SPARSE_DATA_THRESHOLD) {
        return null;
    }

    const sparseRange = getSparseRange(chartSpan, sortedData);
    if (!sparseRange) return null;

    return bucketChartData(sortedData, getSparseBucketSize(chartSpan), {
        startTime: sparseRange.start,
        endTime: sparseRange.end,
        padStartWithFirstValue: true,
    });
}

function getVisibleTimeRange(data: IChart["chartData"], chartSpan: IChart["chartSpan"]) {
    const sortedData = getSortedChartData(data);

    if (!sortedData.length || sortedData.length > 2) return null;

    const firstPointTime = Number(sortedData[0].time);
    const lastPointTime = Number(sortedData[sortedData.length - 1].time);
    const padding = getSparsePaddingSeconds(chartSpan, sortedData.length, lastPointTime - firstPointTime);

    return {
        from: Math.max(0, firstPointTime - padding) as LightWeightCharts.Time,
        to: (lastPointTime + padding) as LightWeightCharts.Time,
    };
}

function getValueRange(data: IChart["chartData"], chartView: IChart["chartView"], isSparseDataset: boolean) {
    if (!data.length) {
        return {
            minValue: 0,
            maxValue: 0,
        };
    }

    const values = data.map((point) => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const delta = maxValue - minValue;
    const padding = delta === 0 ? Math.max(Math.abs(maxValue) * 0.06, 1) : delta * (isSparseDataset ? 0.28 : 0.16);

    if (chartView === CHART_VIEW.BAR) {
        return {
            minValue: 0,
            maxValue: maxValue + padding,
        };
    }

    if (chartView === CHART_VIEW.AREA && !isSparseDataset) {
        return {
            minValue: Math.max(0, minValue - padding * 0.35),
            maxValue: maxValue + padding,
        };
    }

    return {
        minValue: Math.max(0, minValue - padding),
        maxValue: maxValue + padding,
    };
}

function getViewportData(data: IChart["chartData"], chartView: IChart["chartView"], chartSpan: IChart["chartSpan"]) {
    const sortedData = getSortedChartData(data);
    const sparseDisplayData = getSparseDisplayData(sortedData, chartView, chartSpan);
    const displayData = sparseDisplayData || getDisplayChartData(sortedData, chartView, chartSpan);
    const sparseRange = sparseDisplayData ? getSparseRange(chartSpan, sortedData) : null;

    return {
        displayData,
        isSparseDataset: sortedData.length <= SPARSE_DATA_THRESHOLD,
        sortedData,
        visibleTimeRange: sparseRange
            ? {
                  from: sparseRange.start as LightWeightCharts.Time,
                  to: sparseRange.end as LightWeightCharts.Time,
              }
            : getVisibleTimeRange(sortedData, chartSpan),
    };
}

function applyVisibleTimeRange(chart: LightWeightCharts.IChartApi, visibleTimeRange: ReturnType<typeof getVisibleTimeRange>) {
    if (visibleTimeRange) {
        chart.timeScale().setVisibleRange(visibleTimeRange);
        return;
    }

    chart.timeScale().fitContent();
}

function formatDisplayDate(time: LightWeightCharts.Time | undefined) {
    if (!time) return new Date().toLocaleDateString();

    return new Date(Number(time) * 1000).toLocaleDateString();
}

function formatTooltipTimestamp(time: LightWeightCharts.Time) {
    return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(Number(time) * 1000));
}

function formatChartValue(value: number, chartType: IChart["chartType"], tokenA?: string, tokenB?: string) {
    if (chartType === POOL_CHART_TYPE.PRICE && tokenA && tokenB) {
        return `1 ${tokenA} = ${formatAmount(value, 10)} ${tokenB}`;
    }

    return `$${formatAmount(value)}`;
}

function getTooltipPosition(point: LightWeightCharts.Point, container: HTMLDivElement) {
    const maxLeft = Math.max(8, container.clientWidth - TOOLTIP_WIDTH - 8);
    const maxTop = Math.max(8, container.clientHeight - TOOLTIP_HEIGHT - 8);

    let left = point.x + TOOLTIP_OFFSET;
    if (left > maxLeft) {
        left = Math.max(8, point.x - TOOLTIP_WIDTH - TOOLTIP_OFFSET);
    }

    let top = point.y - TOOLTIP_HEIGHT - TOOLTIP_OFFSET;
    if (top < 8) {
        top = Math.min(maxTop, point.y + TOOLTIP_OFFSET);
    }

    return {
        left,
        top,
    };
}

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
    fadeOut,
}: IChart) {
    const chartRef = useRef<HTMLDivElement>(null);

    const [chartCreated, setChart] = useState<LightWeightCharts.IChartApi | undefined>();
    const previousChartDataRef = useRef(chartData);

    const chartCurrentValue = previousChartDataRef.current.length
        ? previousChartDataRef.current[previousChartDataRef.current.length - 1].value
        : 0;
    const chartCurrentDate = previousChartDataRef.current.length
        ? formatDisplayDate(previousChartDataRef.current[previousChartDataRef.current.length - 1].time)
        : formatDisplayDate(undefined);

    const [displayValue, setDisplayValue] = useState(chartCurrentValue);
    const [displayDate, setDisplayDate] = useState(chartCurrentDate);
    const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);

    const handleResize = useCallback(() => {
        if (chartCreated && chartRef.current) {
            chartCreated.resize(chartRef.current.clientWidth, chartRef.current.clientHeight);

            const { visibleTimeRange } = getViewportData(previousChartDataRef.current, chartView, chartSpan);

            applyVisibleTimeRange(chartCreated, visibleTimeRange);
        }
    }, [chartCreated, chartSpan, chartView]);

    const crosshairMoveHandler = useCallback(
        (param: LightWeightCharts.MouseEventParams<LightWeightCharts.Time>) => {
            const { point, time, seriesData } = param;

            if (point && time && seriesData.size && chartRef.current) {
                const data = seriesData.values().next().value;

                let value;
                if (data && "value" in data) {
                    value = data.value; // For LineData or HistogramData
                } else {
                    value = chartCurrentValue; // Default fallback
                }

                setDisplayValue(value);
                setDisplayDate(formatDisplayDate(time));

                const tooltipPosition = getTooltipPosition(point, chartRef.current);

                setTooltipState({
                    left: tooltipPosition.left,
                    top: tooltipPosition.top,
                    timestamp: formatTooltipTimestamp(time),
                    value,
                });
            } else {
                setDisplayValue(chartCurrentValue);
                setDisplayDate(chartCurrentDate);
                setTooltipState(null);
            }
        },
        [chartCurrentDate, chartCurrentValue],
    );

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [chartRef, handleResize]);

    useLayoutEffect(() => {
        if (!chartRef.current) return;

        const sourceData = isChartDataLoading ? previousChartDataRef.current : chartData;
        const { displayData, isSparseDataset, sortedData, visibleTimeRange } = getViewportData(sourceData, chartView, chartSpan);

        if (!displayData.length) return;

        const valueRange = getValueRange(displayData, chartView, isSparseDataset);

        if (!isChartDataLoading) {
            previousChartDataRef.current = sortedData;
        }

        if (chartRef.current.hasChildNodes()) chartRef.current.innerHTML = "";

        const styles = getComputedStyle(document.documentElement);
        const backgroundColor = styles.getPropertyValue("--bg-100").trim();
        const textColor = styles.getPropertyValue("--text-200").trim();
        const borderColor = styles.getPropertyValue("--bg-300").trim();
        const primaryColor = styles.getPropertyValue("--primary-200").trim();

        const chart = LightWeightCharts.createChart(chartRef.current, {
            width: chartRef.current.clientWidth,
            height: chartRef.current.clientHeight || height,
            layout: {
                background: {
                    type: LightWeightCharts.ColorType.Solid,
                    color: "transparent",
                },
                textColor,
            },
            grid: {
                vertLines: {
                    color: withOpacity(borderColor, 0.3),
                    style: LightWeightCharts.LineStyle.Solid,
                },
                horzLines: {
                    color: withOpacity(borderColor, 0.22),
                    style: LightWeightCharts.LineStyle.Solid,
                },
            },
            crosshair: {
                mode: LightWeightCharts.CrosshairMode.Magnet,
                horzLine: {
                    color: withOpacity(primaryColor, 0.35),
                    visible: true,
                    labelVisible: false,
                    style: LightWeightCharts.LineStyle.Dashed,
                },
                vertLine: {
                    visible: true,
                    color: withOpacity(primaryColor, 0.35),
                    labelVisible: false,
                    style: LightWeightCharts.LineStyle.Dashed,
                },
            },
            leftPriceScale: {
                scaleMargins: {
                    top: 0.12,
                    bottom: 0.08,
                },
                visible: false,
            },
            rightPriceScale: {
                visible: false,
            },
            timeScale: {
                borderVisible: false,
                barSpacing: isSparseDataset ? 72 : 18,
                fixLeftEdge: true,
                fixRightEdge: true,
                lockVisibleTimeRangeOnResize: true,
                minBarSpacing: 10,
                rightBarStaysOnScroll: true,
                rightOffset: 0,
                timeVisible: true,
                ticksVisible: false,
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

        let nextSeries: LightWeightCharts.ISeriesApi<"Line" | "Area" | "Histogram">;

        if (chartView === CHART_VIEW.AREA) {
            nextSeries = chart.addAreaSeries({
                topColor: withOpacity(primaryColor, 0.18),
                bottomColor: withOpacity(primaryColor, 0.02),
                crosshairMarkerBackgroundColor: primaryColor,
                crosshairMarkerBorderColor: backgroundColor,
                crosshairMarkerBorderWidth: 2,
                crosshairMarkerRadius: 4,
                crosshairMarkerVisible: true,
                lineColor: primaryColor,
                lineType: LightWeightCharts.LineType.Curved,
                lineWidth: 3,
                lastValueVisible: false,
                priceLineVisible: false,
                priceScaleId: "left",
                priceFormat: {
                    type: "custom",
                    formatter: (price: LightWeightCharts.BarPrice) => formatAmount(price),
                },
                autoscaleInfoProvider: () => ({
                    priceRange: valueRange,
                }),
            });
        } else if (chartView === CHART_VIEW.LINE) {
            nextSeries = chart.addLineSeries({
                color: primaryColor,
                crosshairMarkerBackgroundColor: primaryColor,
                crosshairMarkerBorderColor: backgroundColor,
                crosshairMarkerBorderWidth: 2,
                crosshairMarkerRadius: 4,
                crosshairMarkerVisible: true,
                lastValueVisible: false,
                lineType: LightWeightCharts.LineType.Curved,
                lineWidth: 3,
                priceLineVisible: false,
                priceScaleId: "left",
                priceFormat: {
                    type: "custom",
                    formatter: (price: LightWeightCharts.BarPrice) => formatAmount(price),
                },
                autoscaleInfoProvider: () => ({
                    priceRange: valueRange,
                }),
            });
        } else {
            nextSeries = chart.addHistogramSeries({
                color: withOpacity(primaryColor, 0.72),
                base: 0,
                priceLineVisible: false,
                priceScaleId: "left",
                priceFormat: {
                    type: "custom",
                    formatter: (price: LightWeightCharts.BarPrice) => formatAmount(price),
                },
                autoscaleInfoProvider: () => ({
                    priceRange: valueRange,
                }),
            });
        }

        nextSeries.setData(displayData);

        applyVisibleTimeRange(chart, visibleTimeRange);

        setChart(chart);

        return () => {
            chart.remove();
        };
    }, [chartData, chartSpan, chartView, height, isChartDataLoading]);

    useEffect(() => {
        if (!chartCreated) return undefined;

        chartCreated.subscribeCrosshairMove(crosshairMoveHandler);

        return () => chartCreated.unsubscribeCrosshairMove(crosshairMoveHandler);
    }, [chartCreated, crosshairMoveHandler]);

    useEffect(() => {
        setDisplayValue(chartCurrentValue);
        setDisplayDate(chartCurrentDate);
    }, [chartCurrentDate, chartCurrentValue]);

    return (
        <>
            <div className="text-title flex flex-col-reverse items-start text-left lg:flex-row lg:justify-between">
                <div>
                    <div className="mb-2 font-medium text-xl text-text">{chartTitle}</div>

                    <div className="mb-2 text-2xl font-medium text-text">
                        {displayValue !== undefined ? (
                            formatChartValue(displayValue, chartType, tokenA, tokenB)
                        ) : chartCurrentValue !== undefined ? (
                            formatChartValue(chartCurrentValue, chartType, tokenA, tokenB)
                        ) : (
                            <div className="min-h-[56px]">
                                <span className="inline-block h-[24px] w-[24px] animate-spin rounded-full border-2 border-solid border-white border-b-transparent" />
                            </div>
                        )}
                    </div>

                    <div className="mb-5 text-sm text-text-muted">{displayValue !== undefined ? displayDate : null}</div>
                </div>

                <div className="mb-4 flex w-full items-center justify-center gap-2 md:mb-0 md:w-fit">
                    <ChartSpanSelector chartSpan={chartSpan} handleChangeChartSpan={setChartSpan} />
                    {showTypeSelector && <ChartTypeSelector chartType={chartType} handleChangeChartType={setChartType} />}
                </div>
            </div>
            <div className={cn("relative", fadeOut && "soft-div")}>
                {!previousChartDataRef.current.length && !chartData.length && isChartDataLoading ? (
                    <div className="w-full h-full min-h-[180px] flex items-center justify-center">
                        <Loader className="w-10 h-10" />
                    </div>
                ) : (
                    <div
                        className={`transition-all duration-1000 hover:cursor-crosshair ${
                            isChartDataLoading ? "opacity-40 animate-pulse" : "opacity-100"
                        }`}
                        style={{ height: `${height}px` }}
                        ref={chartRef}
                    />
                )}
                {tooltipState ? (
                    <div
                        className="pointer-events-none absolute z-10 min-w-40 rounded-lg border border-border bg-background/95 px-3 py-2 shadow-sm backdrop-blur-sm"
                        style={{
                            left: tooltipState.left,
                            top: tooltipState.top,
                            width: `${TOOLTIP_WIDTH}px`,
                        }}
                    >
                        <div className="text-sm font-medium text-text">
                            {formatChartValue(tooltipState.value, chartType, tokenA, tokenB)}
                        </div>
                        <div className="mt-1 text-xs text-text-muted">{tooltipState.timestamp}</div>
                    </div>
                ) : null}
                {/* {!chartData?.length ? (
                    <div className="absolute top-0 flex h-full w-full items-center justify-center">
                        <span className="h-[24px] w-[24px] animate-spin rounded-full border-2 border-solid border-white border-b-transparent" />
                    </div>
                ) : null} */}
            </div>
        </>
    );
}
