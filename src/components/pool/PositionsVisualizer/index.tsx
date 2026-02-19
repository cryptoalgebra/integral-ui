import { useEffect, useMemo, useRef, useState } from "react";
import {
    type Selection,
    axisBottom,
    axisLeft,
    pointer,
    curveMonotoneX,
    extent,
    line,
    scaleLinear,
    scaleTime,
    select,
    timeFormat,
} from "d3";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/common/cn";
import { usePoolChartData } from "@/hooks/analytics";
import { CHART_SPAN, ChartSpanType, POOL_CHART_TYPE } from "@/types/swap-chart";
import { ChartSpanSelector } from "@/components/common/ChartSpanSelector";
import { formatAmount } from "@/utils/common/formatAmount";

export interface PositionVisualizerItem {
    id: string;
    startTime: number;
    endTime?: number | null;
    priceLower: number;
    priceUpper: number;
    isClosed?: boolean;
}

interface PositionsVisualizerProps {
    poolId?: string;
    positions: PositionVisualizerItem[];
    className?: string;
    height?: number;
    onSelectionChange?: (ids: string[]) => void;
}

const CHART_MARGIN = { top: 16, right: 16, bottom: 36, left: 72 };
const POSITION_COLORS = ["#22d3ee", "#14b8a6", "#60a5fa", "#f59e0b", "#f97316", "#a78bfa", "#ec4899", "#34d399", "#f43f5e", "#84cc16"];

function colorForId(id: string): string {
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return POSITION_COLORS[Math.abs(hash) % POSITION_COLORS.length];
}

export default function PositionsVisualizer({ poolId, positions, className, height = 360, onSelectionChange }: PositionsVisualizerProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [span, setSpan] = useState<ChartSpanType>(CHART_SPAN.WEEK);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [chartWidth, setChartWidth] = useState(0);

    const { chartData: priceChartData, loading: isPriceLoading } = usePoolChartData(poolId, span, POOL_CHART_TYPE.PRICE, true);

    useEffect(() => {
        const updateWidth = () => {
            setChartWidth(wrapperRef.current?.clientWidth || 0);
        };

        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    useEffect(() => {
        setSelectedIds((prev) => {
            const available = new Set(positions.map((p) => p.id));
            const next = prev.filter((id) => available.has(id));
            const computed = next.length > 0 ? next : positions.map((p) => p.id);
            onSelectionChange?.(computed);
            return computed;
        });
    }, [positions, onSelectionChange]);

    const selectedPositions = useMemo(() => {
        const selected = new Set(selectedIds);
        return positions.filter((p) => selected.has(p.id));
    }, [positions, selectedIds]);

    const groupedPositions = useMemo(() => {
        return {
            open: positions.filter((position) => !position.isClosed),
            closed: positions.filter((position) => position.isClosed),
        };
    }, [positions]);

    const updateSelection = (id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = checked ? [...new Set([...prev, id])] : prev.filter((value) => value !== id);
            onSelectionChange?.(next);
            return next;
        });
    };

    useEffect(() => {
        if (!svgRef.current || chartWidth === 0) return;

        const nowSec = Math.floor(Date.now() / 1000);
        const chartPositions = selectedPositions;

        const root = select(svgRef.current);
        root.selectAll("*").remove();
        root.on(".positions-overlay", null);

        const width = chartWidth;
        const innerWidth = Math.max(0, width - CHART_MARGIN.left - CHART_MARGIN.right);
        const innerHeight = Math.max(0, height - CHART_MARGIN.top - CHART_MARGIN.bottom);

        root.attr("viewBox", `0 0 ${width} ${height}`).attr("width", width).attr("height", height);

        if (innerWidth === 0 || innerHeight === 0) return;

        const priceTimeValues = priceChartData.map((item) => Number(item.time));
        const timeValues =
            priceTimeValues.length > 0 ? priceTimeValues : chartPositions.flatMap((position) => [position.startTime, position.endTime ?? nowSec]);

        if (timeValues.length === 0) return;

        const timeRange = extent(timeValues);
        if (timeRange[0] == null || timeRange[1] == null) return;

        const positionPriceValues = chartPositions
            .flatMap((position) => [position.priceLower, position.priceUpper])
            .filter((value) => Number.isFinite(value));
        const fallbackPriceValues = priceChartData.map((item) => item.value).filter((value) => Number.isFinite(value));
        const sourceValues = positionPriceValues.length > 0 ? positionPriceValues : fallbackPriceValues;

        if (sourceValues.length === 0) return;

        const positionsMin = Math.min(...sourceValues);
        const positionsMax = Math.max(...sourceValues);
        const minPadding = Math.abs(positionsMin) * 0.05;
        const maxPadding = Math.abs(positionsMax) * 0.05;
        const rawPriceMin = positionsMin - minPadding;
        const rawPriceMax = positionsMax + maxPadding;

        const x = scaleTime<number, number>()
            .domain([new Date(timeRange[0] * 1000), new Date(timeRange[1] * 1000)])
            .range([CHART_MARGIN.left, CHART_MARGIN.left + innerWidth]);

        const y = scaleLinear()
            .domain([Math.max(0, rawPriceMin), rawPriceMax])
            .nice()
            .range([CHART_MARGIN.top + innerHeight, CHART_MARGIN.top]);

        const g = root.append("g");

        g.append("g")
            .attr("transform", `translate(0, ${CHART_MARGIN.top + innerHeight})`)
            .call(axisBottom(x).ticks(6).tickFormat(timeFormat("%b %d") as never))
            .call((axis) => axis.select(".domain").attr("stroke", "rgba(255,255,255,0.25)"))
            .call((axis) => axis.selectAll("text").attr("fill", "rgba(255,255,255,0.75)").attr("font-size", 12))
            .call((axis) => axis.selectAll("line").attr("stroke", "rgba(255,255,255,0.2)"));

        g.append("g")
            .attr("transform", `translate(${CHART_MARGIN.left}, 0)`)
            .call(axisLeft(y).ticks(6))
            .call((axis) => axis.select(".domain").attr("stroke", "rgba(255,255,255,0.25)"))
            .call((axis) => axis.selectAll("text").attr("fill", "rgba(255,255,255,0.75)").attr("font-size", 12))
            .call((axis) => axis.selectAll("line").attr("stroke", "rgba(255,255,255,0.12)"));

        g.append("text")
            .attr("x", CHART_MARGIN.left + innerWidth / 2)
            .attr("y", height - 6)
            .attr("text-anchor", "middle")
            .attr("fill", "rgba(255,255,255,0.72)")
            .attr("font-size", 12)
            .text("Time");

        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(CHART_MARGIN.top + innerHeight / 2))
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .attr("fill", "rgba(255,255,255,0.72)")
            .attr("font-size", 12)
            .text("Pool price");

        const clipId = `positions-visualizer-clip-${Math.abs(Math.floor(Math.random() * 1e9))}`;
        root.append("defs")
            .append("clipPath")
            .attr("id", clipId)
            .append("rect")
            .attr("x", CHART_MARGIN.left)
            .attr("y", CHART_MARGIN.top)
            .attr("width", innerWidth)
            .attr("height", innerHeight);

        const plotLayer = g.append("g").attr("aria-label", "plot-layer").attr("clip-path", `url(#${clipId})`);
        const priceLayer = plotLayer.append("g").attr("aria-label", "price-layer");
        const positionsLayer = plotLayer.append("g").attr("aria-label", "positions-layer");
        const overlayLayer = g.append("g").attr("aria-label", "overlay-layer").style("pointer-events", "none");

        const minTooltip = overlayLayer.append("g").style("display", "none");
        const minTooltipRect = minTooltip.append("rect").attr("rx", 6).attr("height", 20);
        const minTooltipText = minTooltip.append("text").attr("x", 8).attr("y", 14).attr("fill", "white").attr("font-size", 11).attr("font-weight", 600);

        const maxTooltip = overlayLayer.append("g").style("display", "none");
        const maxTooltipRect = maxTooltip.append("rect").attr("rx", 6).attr("height", 20);
        const maxTooltipText = maxTooltip.append("text").attr("x", 8).attr("y", 14).attr("fill", "white").attr("font-size", 11).attr("font-weight", 600);

        const poolPriceTooltip = overlayLayer.append("g").style("display", "none");
        const poolPriceTooltipRect = poolPriceTooltip.append("rect").attr("rx", 6).attr("height", 20).attr("fill", "var(--primary-200)");
        const poolPriceTooltipText = poolPriceTooltip
            .append("text")
            .attr("x", 8)
            .attr("y", 14)
            .attr("fill", "white")
            .attr("font-size", 11)
            .attr("font-weight", 600);

        const hoverLine = overlayLayer
            .append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", CHART_MARGIN.top)
            .attr("y2", CHART_MARGIN.top + innerHeight)
            .attr("stroke", "rgba(255,255,255,0.45)")
            .attr("stroke-dasharray", "4 4")
            .style("display", "none");

        const updateTag = (
            tag: Selection<SVGGElement, unknown, null, undefined>,
            bg: Selection<SVGRectElement, unknown, null, undefined>,
            label: Selection<SVGTextElement, unknown, null, undefined>,
            value: number,
            yValue: number,
            fill: string,
            anchorX: number
        ) => {
            const text = formatAmount(value, 6);
            label.text(text);
            bg.attr("fill", fill);
            const width = (label.node()?.getComputedTextLength() || 0) + 16;
            bg.attr("width", width);
            const yPos = Math.max(CHART_MARGIN.top, Math.min(CHART_MARGIN.top + innerHeight - 20, yValue - 10));
            tag.attr("transform", `translate(${anchorX}, ${yPos})`).style("display", "block");
        };

        const findNearestPoolPoint = (hoveredSec: number) => {
            if (sortedPriceData.length === 0) return null;

            let nearest = sortedPriceData[0];
            let diff = Math.abs(nearest.time - hoveredSec);

            for (let i = 1; i < sortedPriceData.length; i++) {
                const nextDiff = Math.abs(sortedPriceData[i].time - hoveredSec);
                if (nextDiff < diff) {
                    nearest = sortedPriceData[i];
                    diff = nextDiff;
                }
            }

            return nearest;
        };

        const updatePoolTooltipAtX = (xPos: number) => {
            if (sortedPriceData.length === 0) return;

            const clampedX = Math.max(CHART_MARGIN.left, Math.min(CHART_MARGIN.left + innerWidth, xPos));
            hoverLine.attr("x1", clampedX).attr("x2", clampedX).style("display", "block");

            const nearest = findNearestPoolPoint(x.invert(clampedX).getTime() / 1000);
            if (!nearest) return;

            const poolY = y(nearest.value);
            poolPriceTooltipText.text(`${formatAmount(nearest.value, 6)}`);
            const width = (poolPriceTooltipText.node()?.getComputedTextLength() || 0) + 16;
            poolPriceTooltipRect.attr("width", width);
            const axisTagX = Math.max(2, CHART_MARGIN.left - width - 8);
            const axisTagY = Math.max(CHART_MARGIN.top, Math.min(CHART_MARGIN.top + innerHeight - 20, poolY - 10));
            poolPriceTooltip.attr("transform", `translate(${axisTagX}, ${axisTagY})`).style("display", "block");
        };

        // Price layer first (below)
        const sortedPriceData = [...priceChartData].sort((a, b) => a.time - b.time);
        if (priceChartData.length > 1) {
            const priceLine = line<{ time: number; value: number }>()
                .defined((point) => Number.isFinite(point.value))
                .x((point) => x(new Date(point.time * 1000)))
                .y((point) => y(point.value))
                .curve(curveMonotoneX);

            priceLayer
                .append("path")
                .datum(sortedPriceData)
                .attr("fill", "none")
                .attr("stroke", "var(--primary-200)")
                .attr("stroke-width", 2)
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round")
                .attr("d", priceLine);
        }

        // Positions layer second (above price)
        chartPositions.forEach((position) => {
            const endTime = position.endTime ?? nowSec;
            const lower = Math.min(position.priceLower, position.priceUpper);
            const upper = Math.max(position.priceLower, position.priceUpper);

            const x0 = x(new Date(position.startTime * 1000));
            const x1 = x(new Date(endTime * 1000));
            const yTop = y(upper);
            const yBottom = y(lower);
            const leftBound = CHART_MARGIN.left;
            const rightBound = CHART_MARGIN.left + innerWidth;
            const topBound = CHART_MARGIN.top;
            const bottomBound = CHART_MARGIN.top + innerHeight;

            if (x1 < leftBound || x0 > rightBound) return;

            const clippedX0 = Math.max(leftBound, Math.min(rightBound, x0));
            const clippedX1 = Math.max(leftBound, Math.min(rightBound, x1));
            const clippedYTop = Math.max(topBound, Math.min(bottomBound, yTop));
            const clippedYBottom = Math.max(topBound, Math.min(bottomBound, yBottom));

            const rectHeight = Math.max(2, clippedYBottom - clippedYTop);
            const rectWidth = Math.max(2, clippedX1 - clippedX0);
            const fill = colorForId(position.id);

            positionsLayer
                .append("rect")
                .attr("x", clippedX0)
                .attr("y", clippedYTop)
                .attr("width", rectWidth)
                .attr("height", rectHeight)
                .attr("rx", 4)
                .attr("fill", fill)
                .attr("fill-opacity", 0.26)
                .attr("stroke", fill)
                .attr("stroke-width", 1.25)
                .on("mouseenter", function () {
                    select(this).attr("fill-opacity", 0.4);
                })
                .on("mousemove", function (event: MouseEvent) {
                    const [mouseX] = pointer(event, root.node());
                    updatePoolTooltipAtX(mouseX);

                    updateTag(minTooltip, minTooltipRect, minTooltipText, lower, y(lower), fill, 6);
                    updateTag(maxTooltip, maxTooltipRect, maxTooltipText, upper, y(upper), fill, 6);
                })
                .on("mouseleave", function () {
                    select(this).attr("fill-opacity", 0.26);
                    minTooltip.style("display", "none");
                    maxTooltip.style("display", "none");
                });
        });

        if (sortedPriceData.length > 0) {
            const latest = sortedPriceData[sortedPriceData.length - 1];
            updatePoolTooltipAtX(x(new Date(latest.time * 1000)));

            root.on("mousemove.positions-overlay", (event: MouseEvent) => {
                const [mouseX, mouseY] = pointer(event, root.node());
                const inPlotX = mouseX >= CHART_MARGIN.left && mouseX <= CHART_MARGIN.left + innerWidth;
                const inPlotY = mouseY >= CHART_MARGIN.top && mouseY <= CHART_MARGIN.top + innerHeight;
                if (!inPlotX || !inPlotY) return;

                updatePoolTooltipAtX(mouseX);
            });

            root.on("mouseleave.positions-overlay", () => {
                minTooltip.style("display", "none");
                maxTooltip.style("display", "none");
                updatePoolTooltipAtX(x(new Date(latest.time * 1000)));
            });
        }

        positionsLayer.raise();
    }, [chartWidth, height, priceChartData, selectedPositions]);

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    return (
        <div className={cn("w-full rounded-xl border border-card-border bg-card p-4", className)}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-base font-semibold">Positions Visualizer</div>
                <div className="flex items-center gap-2">
                    <ChartSpanSelector chartSpan={span} handleChangeChartSpan={setSpan} />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="border border-card-border/60">
                                Select positions
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-80 p-3">
                            <div className="space-y-3">
                                {positions.length === 0 ? <div className="text-sm text-muted-foreground">No positions</div> : null}
                                {groupedPositions.open.length > 0 ? (
                                    <div>
                                        <div className="mb-1 text-xs text-muted-foreground">Open positions</div>
                                        <div className="space-y-1.5">
                                            {groupedPositions.open.map((position) => (
                                                <label key={position.id} className="flex cursor-pointer items-center gap-2 text-sm">
                                                    <Checkbox
                                                        checked={selectedSet.has(position.id)}
                                                        onCheckedChange={(checked) => updateSelection(position.id, Boolean(checked))}
                                                    />
                                                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: colorForId(position.id) }} />
                                                    <span className="font-medium">#{position.id}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                                {groupedPositions.closed.length > 0 ? (
                                    <div>
                                        <div className="mb-1 text-xs text-muted-foreground">Closed positions</div>
                                        <div className="space-y-1.5">
                                            {groupedPositions.closed.map((position) => (
                                                <label key={position.id} className="flex cursor-pointer items-center gap-2 text-sm">
                                                    <Checkbox
                                                        checked={selectedSet.has(position.id)}
                                                        onCheckedChange={(checked) => updateSelection(position.id, Boolean(checked))}
                                                    />
                                                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: colorForId(position.id) }} />
                                                    <span className="font-medium">#{position.id}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {selectedPositions.length > 0 ? (
                <div className="mb-3 flex flex-wrap gap-2">
                    {selectedPositions.map((position) => (
                        <span
                            key={position.id}
                            className="inline-flex items-center gap-2 rounded-full border border-card-border px-2 py-1 text-xs text-foreground/85"
                        >
                            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: colorForId(position.id) }} />
                            {position.id}
                        </span>
                    ))}
                </div>
            ) : null}

            <div ref={wrapperRef} className="w-full min-h-[220px]">
                {isPriceLoading && priceChartData.length === 0 ? (
                    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">Loading price data...</div>
                ) : (
                    <svg ref={svgRef} className="w-full" role="img" aria-label="Pool positions chart" />
                )}
            </div>
        </div>
    );
}
