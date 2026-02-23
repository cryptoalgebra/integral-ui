import { useMemo } from "react";
import { axisBottom, Axis as D3Axis, NumberValue, ScaleLinear, select } from "d3";

function Axis({ axisGenerator }: { axisGenerator: D3Axis<NumberValue> }) {
    const axisRef = (axis: SVGGElement | null) => {
        if (!axis) return;

        const selectedAxis = select(axis);
        selectedAxis.call(axisGenerator);
        selectedAxis.call(axisGenerator.tickSizeOuter(0));
        selectedAxis.call((g) => g.select(".domain").attr("stroke", "#919191"));
    };

    return <g ref={axisRef} />;
}

export const AxisBottom = ({
    xScale,
    innerHeight,
    offset = 0,
    color,
}: {
    xScale: ScaleLinear<number, number>;
    innerHeight: number;
    offset?: number;
    color: string;
}) =>
    useMemo(
        () => (
            <g color={color} className="[&_line]:hidden [&_text]:fill-primary-foreground [&_text]:text-[12px]" transform={`translate(0, ${innerHeight + offset})`}>
                <Axis axisGenerator={axisBottom(xScale).ticks(5)} />
            </g>
        ),
        [color, innerHeight, offset, xScale]
    );
