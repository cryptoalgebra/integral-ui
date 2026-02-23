import { useMemo } from "react";
import { ScaleLinear } from "d3";

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
                pointerEvents="none"
                fill="none"
                stroke={color}
                strokeWidth={1}
                strokeDasharray="2 2"
                x1={xScale(value)}
                y1="0"
                x2={xScale(value)}
                y2={innerHeight}
            />
        ),
        [color, xScale, value, innerHeight]
    );
