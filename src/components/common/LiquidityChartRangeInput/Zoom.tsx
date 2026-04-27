import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  scaleLinear,
  type ScaleLinear,
  select,
  zoom,
  type ZoomBehavior,
  zoomIdentity,
  ZoomTransform,
} from 'd3';
import { Minus, Plus, RefreshCcw } from 'lucide-react';
import { type LiquidityChartRangeInputProps, type ZoomLevels } from './types';
import type { ButtonProps } from '../../ui/button';
import { cn } from '@/utils';

function ZoomButton({ onClick, className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      type={'button'}
      onClick={onClick}
      className={cn('h-4.5 w-4.5 p-0 duration-200', 'max-md:h-4 max-md:w-4', className)}
    >
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
  showResetButton: boolean;
  zoomLevels: ZoomLevels;
  styles: LiquidityChartRangeInputProps['styles'];
  currentPrice: number;
}) {
  const zoomBehavior = useRef<ZoomBehavior<Element, unknown>>(null);

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
    [svg],
  );

  const zoomToRange = useCallback(() => {
    if (!svg || !zoomBehavior.current) return;

    if (!brushDomain) {
      select(svg as Element)
        .transition()
        .duration(500)
        .call(zoomBehavior.current.scaleTo, 1);
      return;
    }

    const xScale = scaleLinear()
      .domain([
        currentPrice * zoomLevels.initialMin,
        currentPrice * zoomLevels.initialMax,
      ] as number[])
      .range([0, width]);

    const [domainMin, domainMax] = brushDomain;
    const range = domainMax - domainMin;
    const padding = range * 0.4;

    const [fullMin, fullMax] = xScale.domain();
    const fullRange = fullMax - fullMin;

    if (domainMin >= domainMax) return;

    if (range > Number.MAX_SAFE_INTEGER) {
      const scale = 0.08;
      const translateX = width / (scale * 23) - xScale(fullMax) * scale;
      const newTransform = zoomIdentity.translate(translateX, 0).scale(scale);
      select(svg as Element)
        .transition()
        .duration(500)
        .call(zoomBehavior.current.transform, newTransform);
      return;
    }

    const paddedMin = domainMin - padding;
    const paddedMax = domainMax + padding;
    const targetRange = paddedMax - paddedMin;
    const scaleByBrush = fullRange / targetRange;

    const center = (paddedMin + paddedMax) / 2;
    const translateX = width / 2 - xScale(center) * scaleByBrush;

    const newTransform = zoomIdentity.translate(translateX, 0).scale(scaleByBrush);

    select(svg as Element)
      .transition()
      .duration(500)
      .call(zoomBehavior.current.transform, newTransform);
  }, [svg, brushDomain, currentPrice, zoomLevels.initialMin, zoomLevels.initialMax, width]);

  useEffect(() => {
    if (!svg) return;

    zoomBehavior.current = zoom()
      .scaleExtent([zoomLevels.min, zoomLevels.max])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', ({ transform }: { transform: ZoomTransform }) => setZoom(transform));

    select(svg as Element).call(zoomBehavior.current);
  }, [height, width, setZoom, svg, zoomBehavior, zoomLevels, zoomLevels.max, zoomLevels.min]);

  useEffect(() => {
    zoomToRange();
  }, [zoomToRange]);

  return (
    <div className='ml-auto flex w-fit animate-fade-in gap-1 transition-all duration-200 group-hover:visible max-sm:flex-col'>
      <ZoomButton
        style={{ border: `1px solid ${styles.main.primary}` }}
        className={`flex items-center justify-center rounded-full text-[${styles.main.primary}] bg-[${styles.main.secondary}] hover:bg-[${styles.main.primary}] hover:text-[${styles.main.secondary}]`}
        onClick={zoomIn}
      >
        <Plus />
      </ZoomButton>
      <ZoomButton
        style={{ border: `1px solid ${styles.main.primary}` }}
        className={`flex items-center justify-center rounded-full text-[${styles.main.primary}] bg-[${styles.main.secondary}] hover:bg-[${styles.main.primary}] hover:text-[${styles.main.secondary}]`}
        onClick={zoomOut}
      >
        <Minus />
      </ZoomButton>
      {showResetButton && (
        <ZoomButton
          className={`hover:text-none flex items-center justify-center border-none bg-transparent hover:bg-transparent text-[${styles.main.primary}]`}
          onClick={zoomToRange}
        >
          <RefreshCcw />
        </ZoomButton>
      )}
    </div>
  );
}
