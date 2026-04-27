import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type BaseType,
  type BrushBehavior,
  type BrushSelection,
  brushX,
  type D3BrushEvent,
  type ScaleLinear,
  select,
  type Selection,
  type TransitionLike,
} from 'd3';
import { brushHandleAccentPath, brushHandlePath, OffScreenHandle } from './svg';
import type { LiquidityChartRangeInputProps } from './types';
import usePreviousValue from '@/hooks/uitls/usePreviousValue';

function Handle({
  handleHeight,
  handleColor,
  handleAccentColor,
  handleBg,
  isSelected,
}: {
  handleHeight: number;
  handleColor: string;
  handleAccentColor: string;
  handleBg: string;
  isSelected: boolean;
}) {
  return (
    <g>
      <path
        d={brushHandleAccentPath()}
        fill={handleAccentColor}
        className='transition-opacity duration-300'
        opacity={isSelected ? 0.2 : 0}
        cursor='ew-resize'
        pointerEvents='none'
      />
      <path
        d={brushHandlePath(handleHeight)}
        fill={handleBg}
        stroke={handleColor}
        cursor='ew-resize'
        pointerEvents='none'
      />
    </g>
  );
}

function Tooltip({
  value,
  isVisible,
  flipHandle,
  bgColor,
  textColor,
}: {
  value: string;
  isVisible: boolean;
  flipHandle: boolean | null;
  bgColor: string;
  textColor: string;
}) {
  return (
    <g
      className='transition-opacity duration-300'
      opacity={isVisible ? '1' : '0'}
      transform={`translate(0, -50) scale(${flipHandle ? '1' : '-1'}, 1)`}
    >
      <rect y='0' x='-30' height='30' width='60' rx='16' fill={bgColor} />
      <path transform='translate(0, 25)' fill={bgColor} d='M 0 8 L -12 0 L 12 0 Z' />
      <text
        fontSize='12px'
        textAnchor='middle'
        fill={textColor}
        transform='scale(-1, 1)'
        y='15'
        dominantBaseline='middle'
      >
        {value}
      </text>
    </g>
  );
}

// flips the handles draggers when close to the container edges
const FLIP_HANDLE_THRESHOLD_PX = 20;

// margin to prevent tick snapping from putting the brush off screen
const BRUSH_EXTENT_MARGIN_PX = 2;

/**
 * Returns true if every element in `a` maps to the
 * same pixel coordinate as elements in `b`
 */
const compare = (
  a: [number, number],
  b: [number, number],
  xScale: ScaleLinear<number, number>,
): boolean => {
  try {
    // normalize pixels to 1 decimals
    const aNorm = a.map((x) => xScale(x).toFixed(1));
    const bNorm = b.map((x) => xScale(x).toFixed(1));
    return aNorm.every((v, i) => v === bNorm[i]);
  } catch {
    return false;
  }
};

export const Brush = ({
  id,
  xScale,
  interactive,
  brushLabelValue,
  brushExtent,
  setBrushExtent,
  innerWidth,
  innerHeight,
  eastHandleHeight,
  westHandleHeight,
  styles,
}: {
  id: string;
  xScale: ScaleLinear<number, number>;
  interactive: boolean;
  brushLabelValue: (d: 'w' | 'e', x: number) => string;
  brushExtent: [number, number];
  setBrushExtent: (extent: [number, number], mode: string | undefined) => void;
  innerWidth: number;
  innerHeight: number;
  eastHandleHeight: number;
  westHandleHeight: number;
  styles: LiquidityChartRangeInputProps['styles'];
}) => {
  const brushRef = useRef<SVGGElement | null>(null);
  const brushBehavior = useRef<BrushBehavior<SVGGElement> | null>(null);

  // only used to drag the handles on brush for performance
  const [localBrushExtent, setLocalBrushExtent] = useState<[number, number] | null>(brushExtent);
  const [showLabels, setShowLabels] = useState(false);
  const [hovering, setHovering] = useState(false);

  const previousBrushExtent = usePreviousValue(brushExtent);

  const brushed = useCallback(
    (event: D3BrushEvent<unknown>) => {
      const { type, selection, mode } = event;

      if (!selection) {
        setLocalBrushExtent(null);
        return;
      }

      const scaled = (selection as [number, number]).map(xScale.invert) as [number, number];

      // avoid infinite render loop by checking for change
      if (type === 'end' && !compare(brushExtent, scaled, xScale)) {
        setBrushExtent(scaled, mode);
      }

      setLocalBrushExtent(scaled);
    },
    [xScale, brushExtent, setBrushExtent],
  );

  // keep local and external brush extent in sync
  // i.e. snap to ticks on bruhs end
  useEffect(() => {
    setLocalBrushExtent(brushExtent);
  }, [brushExtent]);

  // initialize the brush
  useEffect(() => {
    if (!brushRef.current) return;

    brushBehavior.current = brushX<SVGGElement>()
      .extent([
        [Math.max(0 + BRUSH_EXTENT_MARGIN_PX, xScale(0)), 0],
        [innerWidth - BRUSH_EXTENT_MARGIN_PX, innerHeight],
      ])
      .handleSize(30)
      .filter(() => interactive)
      .on('brush end', brushed);

    brushBehavior.current(select(brushRef.current));

    if (previousBrushExtent && compare(brushExtent, previousBrushExtent, xScale)) {
      select(brushRef.current)
        .transition()
        .call(
          brushBehavior.current.move as () =>
            | Selection<SVGGElement, SVGGElement, BaseType, unknown>
            | TransitionLike<SVGGElement, SVGGElement>,
          brushExtent.map(xScale),
        );
    }

    // brush linear gradient
    select(brushRef.current).selectAll('.selection').attr('stroke', 'none').attr('fill', 'none');
  }, [brushExtent, brushed, id, innerHeight, innerWidth, interactive, previousBrushExtent, xScale]);

  // respond to xScale changes only
  useEffect(() => {
    if (!brushRef.current || !brushBehavior.current) return;

    brushBehavior.current.move(select(brushRef.current), brushExtent.map(xScale) as BrushSelection);
  }, [brushExtent, xScale]);

  // show labels when local brush changes
  useEffect(() => {
    setShowLabels(true);
    const timeout = setTimeout(() => setShowLabels(false), 1500);
    return () => clearTimeout(timeout);
  }, [localBrushExtent]);

  // variables to help render the SVGs
  const flipWestHandle = localBrushExtent && xScale(localBrushExtent[0]) > FLIP_HANDLE_THRESHOLD_PX;
  const flipEastHandle =
    localBrushExtent && xScale(localBrushExtent[1]) > innerWidth - FLIP_HANDLE_THRESHOLD_PX;

  const showWestArrow =
    localBrushExtent && (xScale(localBrushExtent[0]) < 0 || xScale(localBrushExtent[1]) < 0);
  const showEastArrow =
    localBrushExtent &&
    (xScale(localBrushExtent[0]) > innerWidth || xScale(localBrushExtent[1]) > innerWidth);

  const westHandleInView =
    localBrushExtent &&
    xScale(localBrushExtent[0]) >= 0 &&
    xScale(localBrushExtent[0]) <= innerWidth;
  const eastHandleInView =
    localBrushExtent &&
    xScale(localBrushExtent[1]) >= 0 &&
    xScale(localBrushExtent[1]) <= innerWidth;

  return useMemo(
    () => (
      <>
        <defs>
          <linearGradient id={`${id}-gradient-selection`} x1='0%' y1='100%' x2='100%' y2='100%'>
            <stop />
            <stop offset='1' />
          </linearGradient>

          {/* clips at exactly the svg area */}
          <clipPath id={`${id}-brush-clip`}>
            <rect fill='black' x='0' y='0' width={innerWidth} height={innerHeight} />
          </clipPath>
        </defs>

        {/* will host the d3 brush */}
        <g
          ref={brushRef}
          clipPath={`url(#${id}-brush-clip)`}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        />

        {/* custom brush handles */}
        {localBrushExtent && (
          <>
            {/* west handle */}
            {westHandleInView ? (
              <g
                transform={`translate(${Math.max(0, xScale(localBrushExtent[0]))}, ${
                  innerHeight - westHandleHeight
                }), scale(${flipWestHandle ? '-1' : '1'}, 1)`}
              >
                <Handle
                  handleHeight={westHandleHeight}
                  handleColor={styles.brush.handleStroke}
                  handleAccentColor={styles.brush.handleAccent}
                  handleBg={styles.brush.handleBg}
                  isSelected={hovering}
                />
                <Tooltip
                  value={brushLabelValue('w', localBrushExtent[0])}
                  bgColor={styles.tooltip.bg}
                  textColor={styles.tooltip.primary}
                  isVisible={showLabels || hovering}
                  flipHandle={flipWestHandle}
                />
              </g>
            ) : null}

            {/* east handle */}
            {eastHandleInView ? (
              <g
                transform={`translate(${xScale(localBrushExtent[1])}, ${innerHeight - eastHandleHeight}), scale(${
                  flipEastHandle ? '-1' : '1'
                }, 1)`}
              >
                <Handle
                  handleHeight={eastHandleHeight}
                  handleColor={styles.brush.handleStroke}
                  handleAccentColor={styles.brush.handleAccent}
                  handleBg={styles.brush.handleBg}
                  isSelected={hovering}
                />
                <Tooltip
                  value={brushLabelValue('w', localBrushExtent[1])}
                  bgColor={styles.tooltip.bg}
                  textColor={styles.tooltip.primary}
                  isVisible={showLabels || hovering}
                  flipHandle={flipEastHandle}
                />
              </g>
            ) : null}

            {showWestArrow && <OffScreenHandle color={styles.tooltip.bg} />}

            {showEastArrow && (
              <g transform={`translate(${innerWidth}, 0) scale(-1, 1)`}>
                <OffScreenHandle color={styles.tooltip.bg} />
              </g>
            )}
          </>
        )}
      </>
    ),
    [
      brushLabelValue,
      eastHandleHeight,
      eastHandleInView,
      flipEastHandle,
      flipWestHandle,
      hovering,
      id,
      innerHeight,
      innerWidth,
      localBrushExtent,
      showEastArrow,
      showLabels,
      showWestArrow,
      styles.brush.handleAccent,
      styles.brush.handleBg,
      styles.brush.handleStroke,
      styles.tooltip.bg,
      styles.tooltip.primary,
      westHandleHeight,
      westHandleInView,
      xScale,
    ],
  );
};
