import { useInfoTickData } from "@/hooks/pools/usePoolTickData";
import { useMintState } from "@/state/mintStore";
import { Presets } from "@/types/presets";
import { Token, Price, Currency } from "@cryptoalgebra/integral-sdk";
import { useEffect, useMemo, useState } from "react";
import { Chart } from "./chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useDerivedSwapInfo } from "@/state/swapStore";
import { processTicks } from "@/utils/swap/processTicks";

interface LiquidityChartProps {
    currencyA?: Currency;
    currencyB?: Currency;
    currentPrice?: number;
    priceLower?: Price<Token, Token>;
    priceUpper?: Price<Token, Token>;
}

// const ZOOM_STEP = 5

const LiquidityChart = ({ currencyA, currencyB, currentPrice, priceLower, priceUpper }: LiquidityChartProps) => {

    const { preset } = useMintState()

    const [processedData, setProcessedData] = useState<any>(null)

    const [zoom, setZoom] = useState(50)

    const { tickAfterSwap } = useDerivedSwapInfo();

    const {
        fetchTicksSurroundingPrice: { ticksResult, fetchTicksSurroundingPrice },
    } = useInfoTickData()

    useEffect(() => {
        if (!currencyA || !currencyB) return
        fetchTicksSurroundingPrice(currencyA, currencyB)
    }, [currencyA, currencyB])

    useEffect(() => {
        if (!ticksResult || !ticksResult.ticksProcessed) return

        processTicks(ticksResult, tickAfterSwap)
            .then((data) => setProcessedData(data))
    }, [ticksResult, tickAfterSwap])

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
    
    // const isZoomMin = zoom - ZOOM_STEP <= 10
    // const isZoomMax = zoom + ZOOM_STEP > 40

    // const handleZoomIn = () => setZoom((zoom) => zoom + ZOOM_STEP)
    // const handleZoomOut = () => setZoom((zoom) => zoom - ZOOM_STEP)

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
         /> : <LiquidityChartLoader /> }
    </div>

}

const LiquidityChartLoader = () => <div className="flex items-end gap-4 w-full h-[250px]">
    <Skeleton className="w-[40px] h-[120px] bg-card-light" />
    <Skeleton className="w-[40px] h-[130px] bg-card-light" />
    <Skeleton className="w-[40px] h-[160px] bg-card-light" />
    <Skeleton className="w-[40px] h-[130px] bg-card-light" />
    <Skeleton className="w-[40px] h-[120px] bg-card-light" />
    <Skeleton className="w-[40px] h-[160px] bg-card-light" />
    <Skeleton className="w-[40px] h-[200px] bg-card-light" />
    <Skeleton className="w-[40px] h-[140px] bg-card-light" />
    <Skeleton className="w-[40px] h-[130px] bg-card-light" />
    <Skeleton className="w-[40px] h-[120px] bg-card-light" />
    <Skeleton className="w-[40px] h-[140px] bg-card-light" />
    <Skeleton className="w-[40px] h-[120px] bg-card-light" />
    <Skeleton className="w-[40px] h-[190px] bg-card-light" />
</div>

export default LiquidityChart;