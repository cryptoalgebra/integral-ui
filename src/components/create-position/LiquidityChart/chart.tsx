import { useEffect, useMemo, useRef, useState } from "react";
import { max, scaleLinear, ZoomTransform } from "d3";
import { Area } from "./Area";
import { AxisBottom } from "./AxisBottom";
import { Brush } from "./Brush";
import { Line } from "./Line";
import { ChartEntry, LiquidityChartRangeInputProps } from "./types";
import { Zoom } from "./Zoom";

const xAccessor = (d: ChartEntry) => d.price0;
const yAccessor = (d: ChartEntry) => d.activeLiquidity;

export function Chart({
    id = "liquidityChartRangeInput",
    data: { series, current },
    styles,
    dimensions: { width, height },
    margins,
    interactive = true,
    brushDomain,
    brushLabels,
    onBrushDomainChange,
    zoomLevels,
    isMock,
    isOnlyView,
    labelA = "Token A",
    labelB = "Token B",
}: LiquidityChartRangeInputProps) {
    const zoomRef = useRef<SVGRectElement | null>(null);
    const [zoom, setZoom] = useState<ZoomTransform | null>(null);

    const [innerHeight, innerWidth] = useMemo(() => [height - margins.top, width - margins.left - margins.right], [width, height, margins]);

    const { xScale, yScale } = useMemo(() => {
        const scales = {
            xScale: scaleLinear()
                .domain([current * zoomLevels.initialMin, current * zoomLevels.initialMax] as number[])
                .range([0, innerWidth]),
            yScale: scaleLinear()
                .domain([0, max(series, yAccessor) ?? 0] as number[])
                .range([innerHeight, innerHeight * 0.15]),
        };

        if (zoom) {
            const newXscale = zoom.rescaleX(scales.xScale);
            scales.xScale.domain(newXscale.domain());
        }

        return scales;
    }, [current, zoomLevels.initialMin, zoomLevels.initialMax, innerWidth, series, innerHeight, zoom]);

    useEffect(() => {
        if (!brushDomain && current) {
            onBrushDomainChange([current * zoomLevels.initialMin, current * zoomLevels.initialMax], "init");
        }
    }, [brushDomain, current, zoomLevels.initialMin, zoomLevels.initialMax, onBrushDomainChange]);

    const [columnHeight0, columnHeight1] = useMemo(() => {
        if (!brushDomain) return [150, 110];

        const targetData = brushDomain.map((price) => {
            const closestEntry = series.reduce((prev, curr) =>
                Math.abs(xAccessor(curr) - price) < Math.abs(xAccessor(prev) - price) ? curr : prev
            );
            return closestEntry;
        });

        const columnHeights = targetData.map((entry) => (entry ? yScale(yAccessor(entry)) : 0));

        if ((!columnHeights[0] && !columnHeights[1]) || isMock) return [150, 110];
        if (!columnHeights[0]) return [150, innerHeight - columnHeights[1]];
        if (!columnHeights[1]) return [innerHeight - columnHeights[0], 110];

        return [innerHeight - columnHeights[0], innerHeight - columnHeights[1]];
    }, [brushDomain, series, yScale, innerHeight, isMock]);

    return (
        <>
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
                <clipPath id={`${id}-chart-clip`}>
                    <rect x="0" y="-50" width={innerWidth} height="200%" />
                </clipPath>

                <g transform={`translate(${margins.left},${margins.top})`}>
                    <g clipPath={`url(#${id}-chart-clip)`}>
                        <Area
                            series={series}
                            xScale={xScale}
                            yScale={yScale}
                            xValue={xAccessor}
                            yValue={yAccessor}
                            highlightDomain={brushDomain}
                            gap={(zoom?.k || 0) < 0.1 ? 0 : (zoom?.k || 0) < 0.5 ? 0.1 : 0.5}
                            inRangeColor={styles.area.selection}
                            currentColor={styles.area.current}
                            labelA={labelA}
                            labelB={labelB}
                        />

                        <rect fill="transparent" cursor="move" width={innerWidth} height={height} ref={zoomRef} />

                        {isOnlyView ? null : (
                            <Brush
                                id={id}
                                xScale={xScale}
                                interactive={interactive}
                                brushLabelValue={brushLabels}
                                brushExtent={brushDomain ?? (xScale.domain() as [number, number])}
                                innerWidth={innerWidth}
                                innerHeight={innerHeight}
                                setBrushExtent={onBrushDomainChange}
                                westHandleHeight={columnHeight0}
                                eastHandleHeight={columnHeight1}
                                styles={styles}
                            />
                        )}

                        <Line color={styles.main.primary} value={current} xScale={xScale} innerHeight={innerHeight} />
                        <AxisBottom xScale={xScale} innerHeight={innerHeight} color={styles.main.primary} />
                    </g>
                </g>
            </svg>

            <div className="absolute left-0 flex w-full animate-fade-in items-start justify-end gap-1 px-1 transition-all duration-200 group-hover:visible">
                <Zoom
                    svg={zoomRef.current}
                    xScale={xScale}
                    setZoom={setZoom}
                    width={innerWidth}
                    height={height}
                    showResetButton
                    zoomLevels={zoomLevels}
                    styles={styles}
                    brushDomain={brushDomain}
                    currentPrice={current}
                />
            </div>
        </>
    );
}
