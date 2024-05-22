import { useInfoTickData } from "@/hooks/pools/usePoolTickData";
import { useMintState } from "@/state/mintStore";
import { Presets } from "@/types/presets";
import { Token, Price, Currency } from "@cryptoalgebra/integral-sdk";
import { useEffect, useMemo, useState } from "react";
import { Chart } from "./chart";
import { processTicks } from "@/utils/swap/processTicks";
import { TicksChartLoader } from "@/components/common/TicksChartLoader";

interface LiquidityChartProps {
    currencyA?: Currency;
    currencyB?: Currency;
    currentPrice?: number;
    priceLower?: Price<Token, Token>;
    priceUpper?: Price<Token, Token>;
}

const LiquidityChart = ({ currencyA, currencyB, currentPrice, priceLower, priceUpper }: LiquidityChartProps) => {

    const { preset } = useMintState()

    const [processedData, setProcessedData] = useState<any>(null)

    const [zoom, setZoom] = useState<number>(50)

    const {
        fetchTicksSurroundingPrice: { ticksResult, fetchTicksSurroundingPrice },
    } = useInfoTickData()

    useEffect(() => {
        if (!currencyA || !currencyB) return
        fetchTicksSurroundingPrice(currencyA, currencyB)
    }, [currencyA, currencyB])

    useEffect(() => {
        if (!currencyA || !currencyB) return;
        if (!ticksResult || !ticksResult.ticksProcessed) return;

        processTicks(currencyA, currencyB, ticksResult.activeTickIdx, ticksResult, null)
            .then((data) => setProcessedData(data))
            .catch(() => {
                processTicks(currencyB, currencyA, ticksResult.activeTickIdx, ticksResult, null, true).then((reversedData) =>
                    setProcessedData(reversedData)
                );
            });
    }, [ticksResult, currencyA, currencyB])

    useEffect(() => {

        if (preset === null) return
        switch (preset) {
            case Presets.FULL:
                setZoom(10)
                break;
            case Presets.NORMAL:
                setZoom(25)
                break;
            case Presets.RISK:
                setZoom(30)
                break;
            case Presets.SAFE:
                setZoom(15);
                break;
            case Presets.STABLE:
                setZoom(40)
                break;
        }
    }, [preset])

    const formattedData = useMemo(() => {
        if (!processedData) return undefined
        if (processedData && processedData.length === 0) return undefined

        const middle = Math.round(processedData.length / 2)
        const chunkLength = Math.round(processedData.length / zoom)

        const slicedData = processedData.slice(middle - chunkLength, middle + chunkLength)

        return slicedData.reverse()
    }, [processedData, zoom])
    
    const isSorted = currencyA && currencyB && currencyA?.wrapped.sortsBefore(currencyB?.wrapped)

    const leftPrice = useMemo(() => {
        return isSorted ? priceLower?.toSignificant(18) : priceUpper?.invert().toSignificant(18)
    }, [isSorted, priceLower, priceUpper])

    const rightPrice = useMemo(() => {
        return isSorted ? priceUpper?.toSignificant(18) : priceLower?.invert().toSignificant(18)
    }, [isSorted, priceLower, priceUpper])

    return <div className="flex w-full h-full">
        {formattedData ?  <Chart 
            formattedData={formattedData} 
            leftPrice={leftPrice} 
            rightPrice={rightPrice} 
            currentPrice={currentPrice} 
            isSorted={isSorted} 
            zoom={zoom} 
            currencyA={currencyA} 
            currencyB={currencyB}
         /> : <TicksChartLoader /> }
    </div>

}

export default LiquidityChart;