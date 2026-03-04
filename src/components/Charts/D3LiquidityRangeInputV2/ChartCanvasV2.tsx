import { curveMonotoneX, line as d3Line, scaleLinear, scaleTime } from "d3";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { priceToY, ROW_HEIGHT } from "./chartMathV2";
import { LiquidityChartCommandsV2, LiquidityChartStateV2, LiquidityPointV2, PricePointV2 } from "./typesV2";

const TIMESCALE_HEIGHT = 24;
const SIDE_INDICATOR_WIDTH = 16;
const CHART_PADDING_X = 10;

function formatTimeLabel(timestamp: number) {
    return new Date(timestamp * 1000).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function yToInterpolatedPrice({
    y,
    liquidityData,
    zoom,
    panY,
}: {
    y: number;
    liquidityData: LiquidityPointV2[];
    zoom: number;
    panY: number;
}) {
    if (liquidityData.length === 0) {
        return 0;
    }

    const rowHeight = ROW_HEIGHT * zoom;
    const descFloat = (y - panY) / rowHeight - 0.5;
    const ascFloat = liquidityData.length - 1 - descFloat;

    const low = clamp(Math.floor(ascFloat), 0, liquidityData.length - 1);
    const high = clamp(Math.ceil(ascFloat), 0, liquidityData.length - 1);

    if (low === high) {
        return liquidityData[low].price0;
    }

    const t = ascFloat - low;
    const lowPrice = liquidityData[low].price0;
    const highPrice = liquidityData[high].price0;
    return lowPrice + (highPrice - lowPrice) * t;
}

export function ChartCanvasV2({
    priceData,
    liquidityData,
    state,
    commands,
    quoteSymbol,
    rangeEditable = true,
}: {
    priceData: PricePointV2[];
    liquidityData: LiquidityPointV2[];
    state: LiquidityChartStateV2;
    commands: LiquidityChartCommandsV2;
    quoteSymbol?: string;
    rangeEditable?: boolean;
}) {
    const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
    const [lineHover, setLineHover] = useState<{ x: number; y: number; price: number; time: number } | null>(null);
    const [isRangeHovered, setIsRangeHovered] = useState(false);
    const svgRef = useRef<SVGSVGElement | null>(null);

    const chartHeight = state.dimensions.height;
    const totalHeight = chartHeight + TIMESCALE_HEIGHT;
    const chartWidth = state.dimensions.width - SIDE_INDICATOR_WIDTH;

    const maxLiquidity = useMemo(() => {
        return Math.max(1, ...liquidityData.map((item) => item.activeLiquidity));
    }, [liquidityData]);

    const barsScale = useMemo(() => {
        const maxBarWidth = Math.max(10, (chartWidth - 70) * 0.15);
        return scaleLinear().domain([0, maxLiquidity]).range([0, maxBarWidth]);
    }, [chartWidth, maxLiquidity]);

    const timeExtent = useMemo(() => {
        const first = priceData[0]?.time ?? Date.now() / 1000;
        const last = priceData[priceData.length - 1]?.time ?? Date.now() / 1000;
        return [new Date(first * 1000), new Date(last * 1000)] as const;
    }, [priceData]);

    const timeScale = useMemo(() => {
        return scaleTime().domain(timeExtent).range([CHART_PADDING_X, chartWidth - CHART_PADDING_X]);
    }, [chartWidth, timeExtent]);

    const minY = priceToY({
        price: state.range.minPrice,
        liquidityData,
        zoom: state.viewport.zoom,
        panY: state.viewport.panY,
        viewportHeight: chartHeight,
    });

    const maxY = priceToY({
        price: state.range.maxPrice,
        liquidityData,
        zoom: state.viewport.zoom,
        panY: state.viewport.panY,
        viewportHeight: chartHeight,
    });

    const upperY = Math.min(minY, maxY);
    const lowerY = Math.max(minY, maxY);

    const currentPrice = priceData[priceData.length - 1]?.value;
    const currentPriceY = currentPrice
        ? priceToY({
              price: currentPrice,
              liquidityData,
              zoom: state.viewport.zoom,
              panY: state.viewport.panY,
              viewportHeight: chartHeight,
          })
        : undefined;

    const historyPath = useMemo(() => {
        const generator = d3Line<PricePointV2>()
            .curve(curveMonotoneX)
            .x((d) => timeScale(new Date(d.time * 1000)))
            .y((d) =>
                priceToY({
                    price: d.value,
                    liquidityData,
                    zoom: state.viewport.zoom,
                    panY: state.viewport.panY,
                    viewportHeight: chartHeight,
                })
            );

        return generator(priceData) ?? "";
    }, [chartHeight, liquidityData, priceData, state.viewport.panY, state.viewport.zoom, timeScale]);

    useEffect(() => {
        if (!state.interaction.dragHandle) {
            return;
        }

        function onPointerMove(event: PointerEvent) {
            if (!svgRef.current) {
                return;
            }

            const rect = svgRef.current.getBoundingClientRect();
            const y = clamp(event.clientY - rect.top, 0, chartHeight);
            const interpolated = yToInterpolatedPrice({
                y,
                liquidityData,
                zoom: state.viewport.zoom,
                panY: state.viewport.panY,
            });
            commands.updateDrag(interpolated);
        }

        function onPointerUp() {
            commands.endDrag();
        }

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp, { once: true });

        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
    }, [chartHeight, commands, liquidityData, state.interaction.dragHandle, state.viewport.panY, state.viewport.zoom]);

    const handleMouseMove = (event: MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) {
            return;
        }

        const rect = svgRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = clamp(event.clientY - rect.top, 0, chartHeight);
        const rowHeight = Math.max(1, ROW_HEIGHT * state.viewport.zoom - 0.6);
        const inRangeOverlay = x >= 0 && x <= chartWidth && y >= upperY && y <= lowerY;
        setIsRangeHovered(inRangeOverlay);
        const nearestPricePoint = priceData.reduce<PricePointV2 | null>((closest, point) => {
            if (!closest) {
                return point;
            }
            const pointX = timeScale(new Date(point.time * 1000));
            const closestX = timeScale(new Date(closest.time * 1000));
            return Math.abs(pointX - x) < Math.abs(closestX - x) ? point : closest;
        }, null);

        if (nearestPricePoint) {
            const pointX = timeScale(new Date(nearestPricePoint.time * 1000));
            const pointY = priceToY({
                price: nearestPricePoint.value,
                liquidityData,
                zoom: state.viewport.zoom,
                panY: state.viewport.panY,
                viewportHeight: chartHeight,
            });
            const isNearLine = Math.abs(y - pointY) <= 14;
            if (isNearLine) {
                setLineHover({
                    x: pointX,
                    y: pointY,
                    price: nearestPricePoint.value,
                    time: nearestPricePoint.time,
                });
            } else {
                setLineHover(null);
            }
        } else {
            setLineHover(null);
        }

        let hoveredIndex: number | null = null;
        for (let index = 0; index < liquidityData.length; index++) {
            const item = liquidityData[index];
            const centerY = priceToY({
                price: item.price0,
                liquidityData,
                zoom: state.viewport.zoom,
                panY: state.viewport.panY,
                viewportHeight: chartHeight,
            });
            const barY = centerY - rowHeight / 2;
            const barWidth = barsScale(item.activeLiquidity);
            const withinX = x >= CHART_PADDING_X && x <= CHART_PADDING_X + barWidth;
            const withinY = y >= barY && y <= barY + rowHeight;

            if (withinX && withinY) {
                hoveredIndex = index;
                break;
            }
        }

        if (hoveredIndex === null) {
            commands.setHover(null, null);
            setHoverPosition(null);
            return;
        }

        const hoveredPoint = liquidityData[hoveredIndex];
        commands.setHover(hoveredIndex, hoveredPoint.price0);
        setHoverPosition({ x, y });
    };

    const handleMouseLeave = () => {
        commands.setHover(null, null);
        setHoverPosition(null);
        setLineHover(null);
        setIsRangeHovered(false);
    };

    const dragTooltipPrice = state.interaction.dragCurrentPrice;

    return (
        <svg
            ref={svgRef}
            width="100%"
            viewBox={`0 0 ${state.dimensions.width} ${totalHeight}`}
            className="select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <g>
                <rect x={0} y={0} width={chartWidth} height={chartHeight} fill="rgba(255,255,255,0.02)" rx={10} />

                {liquidityData.map((item) => {
                    const y = priceToY({
                        price: item.price0,
                        liquidityData,
                        zoom: state.viewport.zoom,
                        panY: state.viewport.panY,
                        viewportHeight: chartHeight,
                    });
                    const barWidth = barsScale(item.activeLiquidity);
                    const hovered = item.price0 === state.interaction.hoveredPrice;

                    if (y < -8 || y > chartHeight + 8) {
                        return null;
                    }

                    return (
                        <rect
                            key={item.tick}
                            x={CHART_PADDING_X}
                            y={y - (ROW_HEIGHT * state.viewport.zoom) / 2}
                            width={barWidth}
                            height={Math.max(1, ROW_HEIGHT * state.viewport.zoom - 0.6)}
                            fill={hovered ? "#92a0ff" : "#5f6d8a"}
                            opacity={hovered ? 0.95 : 0.7}
                            rx={1}
                        />
                    );
                })}

                <path d={historyPath} stroke="var(--color-primary-200)" strokeWidth={1.5} fill="none" opacity={0.9} />

                <line x1={0} x2={chartWidth} y1={minY} y2={minY} stroke="#7c8cff" strokeWidth={1.5} />
                <line x1={0} x2={chartWidth} y1={maxY} y2={maxY} stroke="#7c8cff" strokeWidth={1.5} />

                {typeof currentPriceY === "number" && (
                    <g>
                        <line x1={0} x2={chartWidth} y1={currentPriceY} y2={currentPriceY} stroke="#f8c35f" strokeDasharray="4 4" strokeWidth={1} />
                        <circle cx={chartWidth - 6} cy={currentPriceY} r={4} fill="#f8c35f" />
                    </g>
                )}

                {lineHover && (
                    <g pointerEvents="none">
                        <line x1={lineHover.x} x2={lineHover.x} y1={0} y2={chartHeight} stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" />
                        <line x1={0} x2={chartWidth} y1={lineHover.y} y2={lineHover.y} stroke="rgba(255,255,255,0.22)" strokeDasharray="3 3" />
                        <circle cx={lineHover.x} cy={lineHover.y} r={4} fill="var(--color-primary-200)" />
                        <g transform={`translate(${Math.min(chartWidth - 148, lineHover.x + 10)}, ${Math.max(10, lineHover.y - 26)})`}>
                            <rect width={140} height={20} fill="#0e121a" stroke="rgba(255,255,255,0.2)" rx={6} />
                            <text x={8} y={14} fill="#e6e9f2" fontSize={11}>
                                {`${lineHover.price.toFixed(6)} ${quoteSymbol ?? ""}`}
                            </text>
                        </g>
                    </g>
                )}

                <rect
                    x={0}
                    y={upperY}
                    width={chartWidth}
                    height={Math.max(0, lowerY - upperY)}
                    fill="rgba(67,97,238,0.20)"
                    cursor={rangeEditable && !state.range.isFullRange ? (state.interaction.dragHandle === "center" ? "grabbing" : "grab") : "default"}
                    onPointerDown={(event) => {
                        if (!rangeEditable || state.range.isFullRange) {
                            return;
                        }
                        event.preventDefault();
                        commands.startDrag("center");
                    }}
                />

                {isRangeHovered && (
                    <g pointerEvents="none">
                        <g transform={`translate(${chartWidth - 92}, ${minY - 10})`}>
                            <rect width={88} height={18} fill="#0e121a" stroke="rgba(255,255,255,0.24)" rx={5} />
                            <text x={6} y={12} fill="#d9e0f3" fontSize={10}>
                                {state.range.minPrice.toFixed(6)}
                            </text>
                        </g>
                        <g transform={`translate(${chartWidth - 92}, ${maxY - 10})`}>
                            <rect width={88} height={18} fill="#0e121a" stroke="rgba(255,255,255,0.24)" rx={5} />
                            <text x={6} y={12} fill="#d9e0f3" fontSize={10}>
                                {state.range.maxPrice.toFixed(6)}
                            </text>
                        </g>
                    </g>
                )}

                <g transform={`translate(${chartWidth + 1},0)`}>
                    <rect x={0} y={0} width={SIDE_INDICATOR_WIDTH - 2} height={chartHeight} fill="rgba(255,255,255,0.05)" rx={4} />
                    <rect
                        x={2}
                        y={upperY}
                        width={SIDE_INDICATOR_WIDTH - 6}
                        height={Math.max(4, lowerY - upperY)}
                        fill="rgba(124,140,255,0.7)"
                        rx={3}
                    />
                </g>

                <line x1={0} x2={chartWidth} y1={0} y2={0} stroke="rgba(255,255,255,0.12)" />
                <line x1={0} x2={chartWidth} y1={chartHeight} y2={chartHeight} stroke="rgba(255,255,255,0.12)" />

                {rangeEditable && !state.range.isFullRange && (
                    <g>
                        <rect
                            x={chartWidth - 28}
                            y={minY - 8}
                            width={28}
                            height={16}
                            fill="transparent"
                            cursor="ns-resize"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                commands.startDrag("min");
                            }}
                        />
                        <rect
                            x={chartWidth - 28}
                            y={maxY - 8}
                            width={28}
                            height={16}
                            fill="transparent"
                            cursor="ns-resize"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                commands.startDrag("max");
                            }}
                        />
                        <rect
                            x={chartWidth - 20}
                            y={(upperY + lowerY) / 2 - 12}
                            width={14}
                            height={24}
                            fill="rgba(124,140,255,0.7)"
                            rx={4}
                            cursor="grab"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                commands.startDrag("center");
                            }}
                        />
                    </g>
                )}

                {hoverPosition && state.interaction.hoveredLiquidityIndex !== null && liquidityData[state.interaction.hoveredLiquidityIndex] && (
                    <g transform={`translate(${Math.min(chartWidth - 160, hoverPosition.x + 12)}, ${Math.max(12, hoverPosition.y - 24)})`}>
                        <rect width={148} height={22} fill="#0e121a" stroke="rgba(255,255,255,0.2)" rx={6} />
                        <text x={8} y={15} fill="#e6e9f2" fontSize={11}>
                            {`Price: ${liquidityData[state.interaction.hoveredLiquidityIndex].price0.toFixed(6)} ${quoteSymbol ?? ""}`}
                        </text>
                    </g>
                )}

                {state.interaction.dragStartRange && (
                    <g transform={`translate(${12},${12})`}>
                        <rect width={186} height={42} fill="#101827" stroke="rgba(255,255,255,0.18)" rx={6} />
                        <text x={8} y={16} fill="#d8dff2" fontSize={11}>
                            {`Drag start: ${state.interaction.dragStartRange.minPrice.toFixed(6)} - ${state.interaction.dragStartRange.maxPrice.toFixed(6)}`}
                        </text>
                        {typeof dragTooltipPrice === "number" && (
                            <text x={8} y={32} fill="#8fa0d8" fontSize={11}>
                                {`Current: ${dragTooltipPrice.toFixed(6)}`}
                            </text>
                        )}
                    </g>
                )}

            </g>

            <g transform={`translate(0, ${chartHeight})`}>
                <rect x={0} y={0} width={chartWidth} height={TIMESCALE_HEIGHT} fill="rgba(255,255,255,0.03)" />
                {timeScale
                    .ticks(4)
                    .map((tick) => ({ x: timeScale(tick), label: formatTimeLabel(tick.getTime() / 1000), key: tick.getTime() }))
                    .map((item) => (
                        <g key={item.key} transform={`translate(${item.x}, 0)`}>
                            <line y1={0} y2={6} stroke="rgba(255,255,255,0.2)" />
                            <text y={17} textAnchor="middle" fontSize={10} fill="#98a2b3">
                                {item.label}
                            </text>
                        </g>
                    ))}
            </g>
        </svg>
    );
}
