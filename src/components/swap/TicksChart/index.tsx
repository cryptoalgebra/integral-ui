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

    const [processedData, setProcessedData] = useState<any>(null)

    const { tickAfterSwap } = useDerivedSwapInfo();

    const {
        fetchTicksSurroundingPrice: { ticksResult, fetchTicksSurroundingPrice, ticksLoading },
    } = useInfoTickData()

    useEffect(() => {
        if (!currencyA || !currencyB || ticksLoading) return
        fetchTicksSurroundingPrice(currencyA, currencyB)
    }, [currencyA, currencyB, ticksLoading])

    useEffect(() => {
        if (!ticksResult || !ticksResult.ticksProcessed || ticksLoading) return

        processTicks(currencyA, currencyB, ticksResult, tickAfterSwap)
            .then((data) => setProcessedData(data))
            .catch(() => {
                processTicks(currencyB, currencyA, ticksResult, tickAfterSwap, true)
                .then((reversedData) => setProcessedData(reversedData))
            })
    }, [ticksResult, tickAfterSwap, ticksLoading])

    const formattedData = useMemo(() => {
        if (!processedData) return undefined
        if (processedData && processedData.length === 0) return undefined

        const middle = Math.round(processedData.length / 2)
        const chunkLength = Math.round(processedData.length / zoom)

        const slicedData = processedData.slice(middle - chunkLength, middle + chunkLength)

        return slicedData.reverse()
    }, [processedData, zoom])
    
    const isSorted = currencyA && currencyB && currencyA?.wrapped.sortsBefore(currencyB?.wrapped)

    return <div className="flex w-full h-full mt-12">
        {formattedData ?  <Chart
            formattedData={formattedData} 
            isSorted={isSorted} 
            zoom={zoom} 
            currencyA={currencyA} 
            currencyB={currencyB}
         /> : <TicksChartLoader /> }
    </div>

}

export default TicksChart;