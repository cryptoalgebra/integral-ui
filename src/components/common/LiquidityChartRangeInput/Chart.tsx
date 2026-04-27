import { useEffect, useMemo, useRef, useState } from 'react';
import { max, scaleLinear, ZoomTransform } from 'd3';
import { Area } from './Area';
import { AxisBottom } from './AxisBottom';
import { Brush } from './Brush';
import { Line } from './Line';
import { type ChartEntry, type LiquidityChartRangeInputProps } from './types';
import { Zoom } from './Zoom';
import { RiskProfit } from './RiskProfit';

const xAccessor = (d: ChartEntry) => d.price0;
const yAccessor = (d: ChartEntry) => d.activeLiquidity;

export function Chart({
  id = 'liquidityChartRangeInput',
  data: { series, current },
  styles,
  dimensions: { width, height },
  margins,
  interactive = true,
  brushDomain,
  brushLabels,
  onBrushDomainChange,
  zoomLevels,
  minPrice24h,
  maxPrice24h,
  isMock,
  isOnlyView,
}: LiquidityChartRangeInputProps) {
  const zoomRef = useRef<SVGRectElement | null>(null);

  const [zoom, setZoom] = useState<ZoomTransform | null>(null);

  const [innerHeight, innerWidth] = useMemo(
    () => [height - margins.top, width - margins.left - margins.right],
    [width, height, margins],
  );

  const { xScale, yScale } = useMemo(() => {
    const scales = {
      xScale: scaleLinear()
        .domain([current * zoomLevels.initialMin, current * zoomLevels.initialMax] as number[])
        .range([0, innerWidth]),
      yScale: scaleLinear()
        .domain([0, max(series, yAccessor)] as number[])
        .range([innerHeight, innerHeight * 0.15]),
    };

    if (zoom) {
      const newXscale = zoom.rescaleX(scales.xScale);
      scales.xScale.domain(newXscale.domain());
    }

    return scales;
  }, [
    current,
    zoomLevels.initialMin,
    zoomLevels.initialMax,
    innerWidth,
    series,
    innerHeight,
    zoom,
  ]);

  // init range domain if unset
  useEffect(() => {
    if (!brushDomain && current) {
      onBrushDomainChange(
        [current * zoomLevels.initialMin, current * zoomLevels.initialMax] as [number, number],
        'init',
      );
    }
  }, [brushDomain, current, zoomLevels.initialMin, zoomLevels.initialMax, onBrushDomainChange]);

  // useEffect(() => {
  //   // reset zoom as necessary
  //   // handleZoomReset();
  //   setZoom(null);
  // }, [zoomLevels]);

  const [columnHeight0, columnHeight1] = useMemo(() => {
    if (!brushDomain) return [150, 110];

    const targetData = brushDomain.map((price) => {
      const closestEntry = series.reduce((prev, curr) =>
        Math.abs(xAccessor(curr) - price) < Math.abs(xAccessor(prev) - price) ? curr : prev,
      );
      return closestEntry;
    });

    const columnHeights = targetData.map((data) => (data ? yScale(yAccessor(data)) : 0));

    if ((!columnHeights[0] && !columnHeights[1]) || isMock) return [150, 110];

    if (!columnHeights[0]) return [150, innerHeight - columnHeights[1]];

    if (!columnHeights[1]) return [innerHeight - columnHeights[0], 110];

    return [innerHeight - columnHeights[0], innerHeight - columnHeights[1]];
  }, [brushDomain, series, yScale, innerHeight, isMock]);

  return (
    <>
      <svg
        width='100%'
        height='100%'
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        <clipPath id={`${id}-chart-clip`}>
          <rect x='0' y='-50' width={innerWidth} height={'200%'} />
        </clipPath>

        <g transform={`translate(${margins.left},${margins.top})`}>
          <g clipPath={`url(#${id}-chart-clip)`}>
            {/* <BackgroundGrid width={innerWidth} height={innerHeight} /> */}
            <Area
              series={series}
              xScale={xScale}
              yScale={yScale}
              xValue={xAccessor}
              yValue={yAccessor}
              highlightDomain={brushDomain}
              gap={(zoom?.k || 0) < 0.1 ? 0 : (zoom?.k || 0) < 0.5 ? 0.1 : 0.5}
              styles={styles}
            />

            <rect
              fill='transparent'
              cursor='move'
              width={innerWidth}
              height={height}
              ref={zoomRef}
            />

            {minPrice24h && maxPrice24h && (
              <>
                <Line
                  color={styles.main.accent}
                  value={minPrice24h}
                  xScale={xScale}
                  innerHeight={innerHeight}
                />
                <Line
                  color={styles.main.accent}
                  value={maxPrice24h}
                  xScale={xScale}
                  innerHeight={innerHeight}
                />
              </>
            )}

            <Line
              color={styles.main.priceLine}
              value={current}
              xScale={xScale}
              innerHeight={innerHeight}
            />

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

            <AxisBottom
              xScale={xScale}
              innerHeight={innerHeight}
              color={styles.brush.handleStroke}
            />
          </g>
        </g>
      </svg>
      <div className='absolute left-0 flex w-full animate-fade-in items-start md:items-center justify-between gap-1 transition-all duration-200 group-hover:visible'>
        {!isOnlyView && (
          <RiskProfit
            price={current}
            priceLower={brushDomain?.[0] || 0}
            priceUpper={brushDomain?.[1] || 0}
          />
        )}
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
