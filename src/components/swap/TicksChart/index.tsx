import { useInfoTickData } from "@/hooks/pools/usePoolTickData";
import { Currency } from "@cryptoalgebra/integral-sdk";
import { useEffect, useMemo, useState } from "react";
import { useDerivedSwapInfo } from "@/state/swapStore";
import { processTicks } from "@/utils/swap/processTicks";
import { TicksChartLoader } from "@/components/common/TicksChartLoader";
import { Chart } from "@/components/create-position/LiquidityChart/chart";

interface TicksChartProps {
    currencyA: Currency;
    currencyB: Currency;
    zoom?: number;
}

const TicksChart = ({ currencyA, currencyB, zoom = 50 }: TicksChartProps) => {
    const [processedData, setProcessedData] = useState<any>(null);

    const { tickAfterSwap, tick } = useDerivedSwapInfo();

    const {
        fetchTicksSurroundingPrice: { ticksResult, fetchTicksSurroundingPrice },
    } = useInfoTickData();

    useEffect(() => {
        if (!currencyA || !currencyB) return;
        fetchTicksSurroundingPrice(currencyA, currencyB);
    }, [currencyA, currencyB]);

    useEffect(() => {
        if (!ticksResult || !ticksResult.ticksProcessed) return;
        if (!tick) return;

        processTicks(currencyA, currencyB, tick, ticksResult, tickAfterSwap)
            .then((data) => setProcessedData(data))
            .catch(() => {
                processTicks(currencyB, currencyA, tick, ticksResult, tickAfterSwap, true).then((reversedData) =>
                    setProcessedData(reversedData)
                );
            });
    }, [ticksResult, tickAfterSwap, tick, currencyA, currencyB]);

    const formattedData = useMemo(() => {
        if (!processedData) return undefined;
        if (processedData && processedData.length === 0) return undefined;

        const middle = Math.round(processedData.length / 2);
        const chunkLength = Math.round(processedData.length / zoom);

        const slicedData = processedData.slice(middle - chunkLength, middle + chunkLength);

        slicedData.forEach((t: any) => (t.showWestArrow = false) || (t.showEastArrow = false));

        const firstTick = slicedData.find((t: any, i) => t.isAfterSwapRange && i === 0 && !t.isAfterSwapTick && !t.isReversed);
        const lastTick = [...slicedData].reverse().find((t: any, i) => t.isAfterSwapRange && i === 0 && !t.isAfterSwapTick && t.isReversed);

        if (firstTick) firstTick.showWestArrow = true;

        if (lastTick) lastTick.showEastArrow = true;

        return slicedData.reverse();
    }, [processedData, zoom]);

    return (
        <div className="flex w-full h-full mt-12">
            {formattedData ? (
                <Chart formattedData={formattedData} zoom={zoom} currencyA={currencyA} currencyB={currencyB} />
            ) : (
                <TicksChartLoader />
            )}
        </div>
    );
};

export default TicksChart;
