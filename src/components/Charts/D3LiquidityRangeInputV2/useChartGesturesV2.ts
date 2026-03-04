import { useCallback, type WheelEvent } from "react";
import { LiquidityChartCommandsV2 } from "./typesV2";

const WHEEL_PAN_SCALE = 0.45;

export function useChartGesturesV2({
    commands,
}: {
    commands: LiquidityChartCommandsV2;
}) {
    const onWheel = useCallback(
        (event: WheelEvent<HTMLElement>) => {
            event.preventDefault();
            const chartTop = event.currentTarget.getBoundingClientRect().top;

            if (event.ctrlKey) {
                const direction = event.deltaY < 0 ? "in" : "out";
                commands.zoom(direction, event.clientY - chartTop);
                return;
            }

            commands.pan(event.deltaY * WHEEL_PAN_SCALE);
        },
        [commands]
    );

    return {
        onWheel,
    };
}
