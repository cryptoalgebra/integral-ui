import { useMemo } from 'react';
import { type ScaleLinear } from 'd3';

export const Line = ({
  value,
  xScale,
  innerHeight,
  color,
}: {
  value: number;
  xScale: ScaleLinear<number, number>;
  innerHeight: number;
  color: string;
}) =>
  useMemo(
    () => (
      <line
        pointerEvents={'none'}
        fill='none'
        stroke={color}
        strokeWidth={2}
        strokeDasharray='3 3'
        x1={xScale(value)}
        y1='0'
        x2={xScale(value)}
        y2={innerHeight}
      />
    ),
    [color, xScale, value, innerHeight],
  );
