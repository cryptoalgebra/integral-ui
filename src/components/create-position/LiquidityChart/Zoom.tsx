import { useCallback, useEffect, useMemo, useRef } from "react";
import { Minus, Plus, RefreshCcw } from "lucide-react";
import { scaleLinear, ScaleLinear, select, zoom, ZoomBehavior, zoomIdentity, ZoomTransform } from "d3";
import { ButtonProps } from "@/components/ui/button";
import { cn } from "@/utils";
import { ChartStyles, ZoomLevels } from "./types";

function ZoomButton({ onClick, className, children, ...props }: ButtonProps) {
    return (
        <button {...props} type="button" onClick={onClick} className={cn("h-5 w-5 p-0 duration-200 max-md:h-4 max-md:w-4", className)}>
            {children}
        </button>
    );
}

export function Zoom({
    svg,
    setZoom,
    width,
    height,
    brushDomain,
    showResetButton = true,
    zoomLevels,
    styles,
    currentPrice,
}: {
    svg: SVGElement | null;
    xScale: ScaleLinear<number, number>;
    setZoom: (transform: ZoomTransform) => void;
    width: number;
    height: number;
    brushDomain: [number, number] | undefined;
    showResetButton?: boolean;
    zoomLevels: ZoomLevels;
    styles: ChartStyles;
    currentPrice: number;
}) {
    const zoomBehavior = useRef<ZoomBehavior<Element, unknown>>();
    const lastTransformRef = useRef<ZoomTransform | null>(null);
    const lastAppliedRangeKeyRef = useRef<string>("");

    const [zoomIn, zoomOut] = useMemo(
        () => [
            () =>
                svg &&
                zoomBehavior.current &&
                select(svg as Element)
                    .transition()
                    .call(zoomBehavior.current.scaleBy, 2),
            () =>
                svg &&
                zoomBehavior.current &&
                select(svg as Element)
                    .transition()
                    .call(zoomBehavior.current.scaleBy, 0.5),
        ],
        [svg]
    );

    const zoomToRange = useCallback(() => {
        if (!svg || !zoomBehavior.current) return;

        if (!brushDomain) {
            select(svg as Element).transition().duration(300).call(zoomBehavior.current.scaleTo, 1);
            return;
        }

        const localXScale = scaleLinear()
            .domain([currentPrice * zoomLevels.initialMin, currentPrice * zoomLevels.initialMax])
            .range([0, width]);

        const [domainMin, domainMax] = brushDomain;
        if (domainMin >= domainMax) return;

        const range = domainMax - domainMin;
        const padding = range * 0.4;

        const [fullMin, fullMax] = localXScale.domain();
        const fullRange = fullMax - fullMin;

        const paddedMin = domainMin - padding;
        const paddedMax = domainMax + padding;
        const targetRange = paddedMax - paddedMin;
        const scaleByBrush = fullRange / targetRange;

        const center = (paddedMin + paddedMax) / 2;
        const translateX = width / 2 - localXScale(center) * scaleByBrush;

        const newTransform = zoomIdentity.translate(translateX, 0).scale(scaleByBrush);

        select(svg as Element).transition().duration(300).call(zoomBehavior.current.transform, newTransform);
    }, [svg, brushDomain, currentPrice, zoomLevels.initialMin, zoomLevels.initialMax, width]);

    useEffect(() => {
        if (!svg) return;

        zoomBehavior.current = zoom()
            .scaleExtent([zoomLevels.min, zoomLevels.max])
            .extent([
                [0, 0],
                [width, height],
            ])
            .on("zoom", ({ transform }: { transform: ZoomTransform }) => {
                const last = lastTransformRef.current;
                if (last && Math.abs(last.x - transform.x) < 0.001 && Math.abs(last.y - transform.y) < 0.001 && Math.abs(last.k - transform.k) < 0.001) {
                    return;
                }
                lastTransformRef.current = transform;
                setZoom(transform);
            });

        select(svg as Element).call(zoomBehavior.current);
    }, [height, width, setZoom, svg, zoomLevels.max, zoomLevels.min]);

    useEffect(() => {
        const key = `${brushDomain?.[0] ?? "na"}:${brushDomain?.[1] ?? "na"}:${currentPrice}:${width}:${height}:${zoomLevels.initialMin}:${zoomLevels.initialMax}`;
        if (lastAppliedRangeKeyRef.current === key) return;
        lastAppliedRangeKeyRef.current = key;
        zoomToRange();
    }, [brushDomain, currentPrice, height, width, zoomLevels.initialMin, zoomLevels.initialMax, zoomToRange]);

    return (
        <div className="ml-auto flex w-fit animate-fade-in gap-1 transition-all duration-200 group-hover:visible max-sm:flex-col">
            <ZoomButton
                style={{ border: `1px solid ${styles.main.primary}` }}
                className="flex items-center justify-center rounded-full"
                onClick={zoomIn}
            >
                <Plus style={{ color: styles.main.primary }} />
            </ZoomButton>
            <ZoomButton
                style={{ border: `1px solid ${styles.main.primary}` }}
                className="flex items-center justify-center rounded-full"
                onClick={zoomOut}
            >
                <Minus style={{ color: styles.main.primary }} />
            </ZoomButton>
            {showResetButton ? (
                <ZoomButton className="flex items-center justify-center border-none bg-transparent hover:bg-transparent" onClick={zoomToRange}>
                    <RefreshCcw style={{ color: styles.main.primary }} />
                </ZoomButton>
            ) : null}
        </div>
    );
}
