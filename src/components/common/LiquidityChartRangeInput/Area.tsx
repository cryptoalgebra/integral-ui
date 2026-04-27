import { useEffect, useMemo, useRef, useState } from 'react';
import { type ScaleLinear } from 'd3';
import { createPortal } from 'react-dom';
import { type ChartEntry, type LiquidityChartRangeInputProps } from './types';
import type { Currency, CurrencyAmount } from '@cryptoalgebra/integral-sdk';
import CurrencyLogo from '../CurrencyLogo';
import { useUSDCValue } from '@/hooks/common/useUSDCValue';
import { formatAmount } from '@/utils';

const Tooltip = ({
  x,
  y,
  price,
  amount0,
  amount1,
}: {
  x: number;
  y: number;
  price: number;
  amount0: CurrencyAmount<Currency> | null;
  amount1: CurrencyAmount<Currency> | null;
}) => {
  const { formatted: amount0Usd } = useUSDCValue(amount0);
  const { formatted: amount1Usd } = useUSDCValue(amount1);

  return createPortal(
    <div
      className='pointer-events-none fixed z-50 flex flex-col gap-1 whitespace-nowrap rounded-lg border border-card-border bg-card p-2 text-[12px] text-text shadow-md'
      style={{
        top: y + 10,
        left: x + 10,
      }}
    >
      <div>Price: {formatAmount(price, 6)}</div>
      {amount0 && amount0.greaterThan(0) && (
        <div className='flex items-center gap-1'>
          <CurrencyLogo currency={amount0.currency} size={20} />
          <span className='font-semibold'>
            {formatAmount(amount0.toSignificant(24), 6)} {amount0.currency.symbol}
          </span>
          {amount0Usd ? <span className='opacity-80'>(${formatAmount(amount0Usd, 2)})</span> : null}
        </div>
      )}
      {amount1 && amount1.greaterThan(0) && (
        <div className='flex items-center gap-1'>
          <CurrencyLogo currency={amount1.currency} size={20} />
          <span className='font-semibold'>
            {formatAmount(amount1.toSignificant(24), 6)} {amount1.currency.symbol}
          </span>
          {amount1Usd ? <span className='opacity-80'>(${formatAmount(amount1Usd, 2)})</span> : null}
        </div>
      )}
    </div>,
    document.body,
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
  styles,
}: {
  series: ChartEntry[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  xValue: (d: ChartEntry) => number;
  yValue: (d: ChartEntry) => number;
  gap?: number;
  borderRadius?: number;
  highlightDomain?: [number, number];
  styles: LiquidityChartRangeInputProps['styles'];
}) {
  const gRef = useRef<SVGGElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    price: number;
    amount0: CurrencyAmount<Currency> | null;
    amount1: CurrencyAmount<Currency> | null;
  } | null>(null);
  const rafRef = useRef<number | null>(null);

  const sortedSeries = series.sort((a, b) => xValue(a) - xValue(b));

  const ranges = useMemo(() => {
    const out: {
      x: number;
      width: number;
      y: number;
      height: number;
      isCurrent: boolean;
      isInRange: boolean;
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
      const x1 = xValue(b ?? a);
      const mid = (x0 + x1) / 2;
      const isInRange = highlightDomain
        ? mid >= (highlightDomain[0] || 0) && mid <= (highlightDomain[1] || 0)
        : true;

      out.push({
        x: xStart,
        width,
        y,
        height,
        isCurrent: a.isCurrent,
        isInRange,
      });
    }
    return out;
  }, [sortedSeries, xScale, xValue, gap, yScale, yValue, highlightDomain]);

  useEffect(() => {
    const g = gRef.current;
    const svg = g?.ownerSVGElement;
    if (!svg) return;

    let lastEvent: MouseEvent | null = null;

    const onMove = (e: MouseEvent) => {
      lastEvent = e;
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          if (!lastEvent || !svg) return;

          const pt = svg.createSVGPoint();
          pt.x = lastEvent.clientX;
          pt.y = lastEvent.clientY;
          const ctm = svg.getScreenCTM();
          if (!ctm) return;
          const svgP = pt.matrixTransform(ctm.inverse());
          const mx = svgP.x;

          const svgRect = svg.getBoundingClientRect();
          if (
            lastEvent.clientX < svgRect.left ||
            lastEvent.clientX > svgRect.right ||
            lastEvent.clientY < svgRect.top ||
            lastEvent.clientY > svgRect.bottom
          ) {
            setHoveredIndex(null);
            setTooltipData(null);
            return;
          }

          let idx: number | null = null;
          for (let i = 0; i < ranges.length; i++) {
            const r = ranges[i];
            if (mx >= r.x && mx <= r.x + r.width) {
              idx = i;
              break;
            }
          }

          setHoveredIndex((prev) => (prev === idx ? prev : idx));

          if (idx !== null) {
            setHoveredIndex(idx);
            setTooltipData({
              x: e.clientX,
              y: e.clientY,
              price: xValue(sortedSeries[idx]),
              amount0: sortedSeries[idx].amount0,
              amount1: sortedSeries[idx].amount1,
            });
          } else {
            setTooltipData((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : prev));
          }
        });
      }
    };

    const onLeave = () => {
      setHoveredIndex(null);
      setTooltipData(null);
    };

    svg.addEventListener('mousemove', onMove, { passive: true });
    svg.addEventListener('mouseleave', onLeave, { passive: true });

    // eslint-disable-next-line consistent-return
    return () => {
      svg.removeEventListener('mousemove', onMove);
      svg.removeEventListener('mouseleave', onLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [ranges]);

  return (
    <>
      <g ref={gRef}>
        {ranges.map((r, i) => {
          const isInRange = r.isInRange;
          const isCurrent = r.isCurrent;
          return (
            <rect
              key={i}
              x={r.x}
              y={r.y}
              width={r.width}
              height={r.height}
              rx={borderRadius}
              ry={borderRadius}
              fill={!isCurrent ? styles.main.primary : styles.main.accent}
              opacity={isInRange ? 1 : 0.3}
              style={{ transition: 'fill 0.2s ease', pointerEvents: 'none' }}
            />
          );
        })}

        <g pointerEvents='none'>
          {hoveredIndex !== null && ranges[hoveredIndex] && (
            <rect
              x={ranges[hoveredIndex].x}
              y={ranges[hoveredIndex].y}
              width={ranges[hoveredIndex].width}
              height={ranges[hoveredIndex].height}
              rx={borderRadius}
              ry={borderRadius}
              fill={!ranges[hoveredIndex].isCurrent ? styles.main.primary : styles.main.accent}
              opacity={ranges[hoveredIndex].isInRange ? 1 : 0.3}
              style={{
                transition: 'fill 0.2s ease',
                filter: 'brightness(1.15)',
              }}
            />
          )}
        </g>
      </g>

      {tooltipData && <Tooltip {...tooltipData} />}
    </>
  );
}
