import { useEffect, useMemo, useRef, useState } from "react";
import { ScaleLinear } from "d3";
import { createPortal } from "react-dom";
import { formatAmount } from "@/utils/common/formatAmount";
import { ChartEntry } from "./types";

const Tooltip = ({
    x,
    y,
    price0,
    price1,
    labelA,
    labelB,
}: {
    x: number;
    y: number;
    price0: number;
    price1: number;
    labelA: string;
    labelB: string;
}) => {
    return createPortal(
        <div
            className="pointer-events-none fixed z-50 flex flex-col gap-1 whitespace-nowrap rounded-lg border border-border-light bg-card p-2 text-[12px] text-primary-foreground shadow-md"
            style={{ top: y + 10, left: x + 10 }}
        >
            <div>{`${labelA} Price: ${formatAmount(price0, 6)} ${labelB}`}</div>
            <div>{`${labelB} Price: ${formatAmount(price1, 6)} ${labelA}`}</div>
        </div>,
        document.body
    );
};

export function Area({
    series,
    xScale,
    yScale,
    xValue,
    yValue,
    gap = 1,
    borderRadius = 3,
    highlightDomain,
    inRangeColor,
    currentColor,
    labelA,
    labelB,
}: {
    series: ChartEntry[];
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
    xValue: (d: ChartEntry) => number;
    yValue: (d: ChartEntry) => number;
    gap?: number;
    borderRadius?: number;
    highlightDomain?: [number, number];
    inRangeColor: string;
    currentColor: string;
    labelA: string;
    labelB: string;
}) {
    const gRef = useRef<SVGGElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [tooltipData, setTooltipData] = useState<{ x: number; y: number; price0: number; price1: number } | null>(null);

    const sortedSeries = useMemo(() => [...series].sort((a, b) => xValue(a) - xValue(b)), [series, xValue]);

    const ranges = useMemo(() => {
        const out: {
            x: number;
            width: number;
            y: number;
            height: number;
            isCurrent: boolean;
            isInRange: boolean;
            price0: number;
            price1: number;
        }[] = [];

        for (let i = 0; i < sortedSeries.length - 1; i++) {
            const a = sortedSeries[i];
            const b = sortedSeries[i + 1];
            const xStart = xScale(xValue(a)) + gap / 2;
            const xEnd = xScale(xValue(b));
            const width = Math.max(0, xEnd - xStart - gap);
            const y = yScale(yValue(a));
            const height = Math.max(0, yScale(0) - y);

            const x0 = xValue(a);
            const x1 = xValue(b);
            const mid = (x0 + x1) / 2;
            const isInRange = highlightDomain ? mid >= highlightDomain[0] && mid <= highlightDomain[1] : true;

            out.push({
                x: xStart,
                width,
                y,
                height,
                isCurrent: a.isCurrent,
                isInRange,
                price0: a.price0,
                price1: a.price1,
            });
        }

        return out;
    }, [sortedSeries, xScale, xValue, gap, yScale, yValue, highlightDomain]);

    useEffect(() => {
        const g = gRef.current;
        const svg = g?.ownerSVGElement;
        if (!svg) return;

        let lastEvent: MouseEvent | null = null;

        const onMove = (event: MouseEvent) => {
            lastEvent = event;
            if (rafRef.current !== null) return;

            rafRef.current = requestAnimationFrame(() => {
                rafRef.current = null;
                if (!lastEvent) return;

                const point = svg.createSVGPoint();
                point.x = lastEvent.clientX;
                point.y = lastEvent.clientY;
                const ctm = svg.getScreenCTM();
                if (!ctm) return;
                const svgPoint = point.matrixTransform(ctm.inverse());
                const mx = svgPoint.x;

                let idx: number | null = null;
                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    if (mx >= range.x && mx <= range.x + range.width) {
                        idx = i;
                        break;
                    }
                }

                setHoveredIndex(idx);
                if (idx !== null) {
                    const range = ranges[idx];
                    setTooltipData({
                        x: lastEvent.clientX,
                        y: lastEvent.clientY,
                        price0: range.price0,
                        price1: range.price1,
                    });
                } else {
                    setTooltipData((prev) => (prev ? { ...prev, x: lastEvent?.clientX || 0, y: lastEvent?.clientY || 0 } : prev));
                }
            });
        };

        const onLeave = () => {
            setHoveredIndex(null);
            setTooltipData(null);
        };

        svg.addEventListener("mousemove", onMove, { passive: true });
        svg.addEventListener("mouseleave", onLeave, { passive: true });

        return () => {
            svg.removeEventListener("mousemove", onMove);
            svg.removeEventListener("mouseleave", onLeave);
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [ranges]);

    return (
        <>
            <g ref={gRef}>
                {ranges.map((range, index) => (
                    <rect
                        key={index}
                        x={range.x}
                        y={range.y}
                        width={range.width}
                        height={range.height}
                        rx={borderRadius}
                        ry={borderRadius}
                        fill={range.isCurrent ? currentColor : inRangeColor}
                        opacity={range.isInRange ? 1 : 0.3}
                        style={{ transition: "fill 0.2s ease", pointerEvents: "none" }}
                    />
                ))}

                {hoveredIndex !== null && ranges[hoveredIndex] ? (
                    <rect
                        x={ranges[hoveredIndex].x}
                        y={ranges[hoveredIndex].y}
                        width={ranges[hoveredIndex].width}
                        height={ranges[hoveredIndex].height}
                        rx={borderRadius}
                        ry={borderRadius}
                        fill={ranges[hoveredIndex].isCurrent ? currentColor : inRangeColor}
                        opacity={ranges[hoveredIndex].isInRange ? 1 : 0.3}
                        style={{ filter: "brightness(1.2)", pointerEvents: "none" }}
                    />
                ) : null}
            </g>

            {tooltipData ? (
                <Tooltip
                    x={tooltipData.x}
                    y={tooltipData.y}
                    price0={tooltipData.price0}
                    price1={tooltipData.price1}
                    labelA={labelA}
                    labelB={labelB}
                />
            ) : null}
        </>
    );
}
