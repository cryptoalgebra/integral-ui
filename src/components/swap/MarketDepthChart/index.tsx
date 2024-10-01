import { MAX_UINT128 } from "@/constants/max-uint128";
import { useInfoTickData } from "@/hooks/pools/usePoolTickData";
import { useDerivedSwapInfo} from "@/state/swapStore";
import { formatCurrency } from "@/utils/common/formatCurrency";
import { ADDRESS_ZERO, CurrencyAmount, Pool, TickMath, Token } from "@cryptoalgebra/sdk"
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Address } from "wagmi";

const NOT_SELECTED = Number.MAX_VALUE

const isAfterCurrent = (index: number) => {
    if (index === 0) {
        return Object.is(index, 0)
    }
    return index > 0
}

interface MarketDepthChartProps {
    currencyA: Token | undefined;
    currencyB: Token | undefined;
    poolAddress: Address | undefined;
    isOpen: boolean;
    close: () => void;
}

const MarketDepthChart = ({ currencyA, currencyB, isOpen, close }: MarketDepthChartProps) => {

    const { tickAfterSwap } = useDerivedSwapInfo();

    const [hoveredIndex, setHoveredIndex] = useState<number>(NOT_SELECTED)

    const [isTickOutside, setIsOutside] = useState(0)

    const [processedData, setProcessedData] = useState<any>(null)
    const {
        fetchTicksSurroundingPrice: { ticksResult, fetchTicksSurroundingPrice },
    } = useInfoTickData()

    useEffect(() => {
        if (!currencyA || !currencyB) return
        fetchTicksSurroundingPrice(currencyA, currencyB)
    }, [currencyA, currencyB])

    useEffect(() => {
        if (!ticksResult || !ticksResult.ticksProcessed) return

        async function processTicks() {

            if (!ticksResult) return

            const _data = await Promise.all(
                ticksResult.ticksProcessed.map(async (t, i) => {
                    const active = t.tickIdx === ticksResult.activeTickIdx
                    const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(t.tickIdx)
                    const mockTicks = [
                        {
                            index: Number(t.tickIdx) - Number(ticksResult.tickSpacing),
                            liquidityGross: t.liquidityGross.toString(),
                            liquidityNet: (t.liquidityNet * -1n).toString(),
                        },
                        {
                            index: t.tickIdx,
                            liquidityGross: t.liquidityGross.toString(),
                            liquidityNet: t.liquidityNet.toString(),
                        },
                    ]
                    const pool =
                        currencyA && currencyB
                            ? new Pool(currencyA.wrapped, currencyB.wrapped, 100, sqrtPriceX96, ADDRESS_ZERO, t.liquidityActive.toString(), t.tickIdx, ticksResult.tickSpacing, mockTicks)
                            : undefined

                    const nextSqrtX96 = ticksResult.ticksProcessed[i - 1]
                        ? TickMath.getSqrtRatioAtTick(ticksResult.ticksProcessed[i - 1].tickIdx)
                        : undefined

                    const maxAmountToken0 = currencyA ? CurrencyAmount.fromRawAmount(currencyA.wrapped, MAX_UINT128.toString()) : undefined


                    const outputRes0 =
                        pool && maxAmountToken0 ? await pool.getOutputAmount(maxAmountToken0, nextSqrtX96) : undefined

                    const token1Amount = outputRes0?.[0] as CurrencyAmount<Token> | undefined

                    const amount0 = token1Amount ? parseFloat(token1Amount.toExact()) * parseFloat(t.price1) : 0
                    const amount1 = token1Amount ? parseFloat(token1Amount.toExact()) : 0

                    return {
                        index: i,
                        isCurrent: active,
                        activeLiquidity: parseFloat(t.liquidityActive.toString()),
                        tick: t.tickIdx,
                        price0: parseFloat(t.price0),
                        price1: parseFloat(t.price1),
                        tvlToken0: amount0,
                        tvlToken1: amount1,
                    }
                })
            )
            setProcessedData(_data)
        }

        processTicks()
    }, [ticksResult])

    const [beforeCurrent, current, afterCurrent, maxLiquidity] = useMemo(() => {
        if (!processedData) return []
        if (processedData && processedData.length === 0) return []

        const middle = Math.round(processedData.length / 2)
        const chunkLength = Math.round(processedData.length / 50)

        const slicedData = processedData.slice(middle - chunkLength, middle + chunkLength).reverse()

        const currentIdx = slicedData.findIndex((v: any) => v.isCurrent)

        const maxLiquidity = slicedData.reduce((acc: any, v: any) => v.activeLiquidity > acc ? v.activeLiquidity : acc, 0)

        return [slicedData.slice(0, currentIdx), slicedData[currentIdx], slicedData.slice(currentIdx + 1), maxLiquidity]
    }, [processedData])

    const invertPrice = currencyA && currencyB && !currencyA.sortsBefore(currencyB)

    const tooltipY = useMemo(() => {

        if (hoveredIndex === NOT_SELECTED) return -9999

        const id = document.getElementById(isAfterCurrent(hoveredIndex) ? `before-current-${hoveredIndex}` : `after-current-${-hoveredIndex}`)

        return id?.offsetTop

    }, [hoveredIndex])

    const tooltipData = useMemo(() => {

        if (hoveredIndex === NOT_SELECTED || !beforeCurrent || !afterCurrent) return

        const summary = isAfterCurrent(hoveredIndex) ? beforeCurrent.slice(hoveredIndex) : afterCurrent.slice(0, -hoveredIndex + 1)

        return summary.reduce((acc: any, v: any) => ({
            price: acc.price + v.price0 / summary.length,
            amount: acc.amount + v.tvlToken0,
            total: acc.total + v.tvlToken1
        }), {
            price: 0,
            amount: 0,
            total: 0
        })

    }, [hoveredIndex, beforeCurrent, afterCurrent])

    const [highestTick, lowestTick] = beforeCurrent && afterCurrent ? [beforeCurrent[0].tick, afterCurrent[afterCurrent.length - 1].tick] : []

    useEffect(() => {

        const tick = tickAfterSwap

        if (!tick) return

        if (tick > highestTick) {
            setIsOutside(1)
        } else if (tick < lowestTick) {
            setIsOutside(-1)
        } else {
            setIsOutside(0)
        }

    }, [highestTick, lowestTick, tickAfterSwap])

    return <div className={`h-[100vh] lg:h-full bg-card fixed border-l border-card-border right-0 top-0 left-0 bottom-0 lg:left-[unset] overflow-x-hidden lg:overflow-x-visible duration-200 z-[99] ${isOpen ? 'w-[100vw] md:w-[380px]' : 'w-[0px]'}`}>

        <div className="flex flex-col lg:flex-row w-full h-full">

            <button
                className="h-full z-[99] p-1 bg-card-dark border-x border-card-border hover:bg-card-hover"
                onClick={close}
            >
                <ArrowRightIcon size={'20px'} className="rotate-180 lg:rotate-0" />
            </button>

            <div className="relative flex flex-col w-full h-full">

                <div className="flex justify-evenly text-sm py-2">
                    <div className="w-full text-left pl-4">{`Price (${currencyB?.symbol})`}</div>
                    <div className="w-full">{`Amount (${currencyA?.symbol})`}</div>
                    <div className="w-full text-right pr-4">{`Total (${currencyB?.symbol})`}</div>
                </div>

                <div className={`absolute lg:-left-[230px] z-[100]`} style={{ top: `${tooltipY}px` }}>
                    <MarketDepthChartTooltip currencyA={currencyA} currencyB={currencyB} tooltipData={tooltipData} />
                </div>

                <div className="relative flex flex-col items-end w-full h-full overflow-y-auto pl-16 text-sm select-none">
                    {isTickOutside === 1 && <div className="flex items-center gap-2 py-1 w-full bg-yellow-600 mb-2 pl-4" style={{ width: 'calc(100% + 4rem)' }}>
                        <ArrowUpIcon size={18} />
                        <span>Price is outside the scope</span>
                    </div>}
                    {
                        beforeCurrent ? beforeCurrent.map((v: any, idx: number) => <div id={`before-current-${idx}`} className={`relative flex items-center h-[25px] py-1 w-full`} onMouseOver={() => setHoveredIndex(idx)} onMouseOut={() => setHoveredIndex(NOT_SELECTED)} >
                            <div className={`absolute flex justify-evenly w-full`}>
                                <div className="w-full text-left -ml-12 text-red-500 font-semibold">{formatCurrency.format(invertPrice ? v.price1 : v.price0)}</div>
                                <div className="w-full">{formatCurrency.format(invertPrice ? v.tvlToken1 : v.tvlToken0)}</div>
                                <div className="w-full text-right pr-4">{formatCurrency.format(invertPrice ? v.tvlToken0 : v.tvlToken1)}</div>
                            </div>
                            <div
                                key={`before-price-${idx}`}
                                className={`h-[20px] rounded-l-lg ml-auto ${idx >= hoveredIndex && hoveredIndex >= 0 && isAfterCurrent(hoveredIndex) && hoveredIndex !== NOT_SELECTED ? 'bg-blue-500/80' : ((v.tick <= (tickAfterSwap || -NOT_SELECTED))) ? 'bg-yellow-600' : 'bg-red-800/40'}`}
                                style={{ width: `${v.activeLiquidity * 100 / maxLiquidity}%` }}></div>
                        </div>) : null
                    }
                    {current && <div className="relative flex items-center justify-between text-lg py-2 px-4 border-y border-card-border my-2 bg-card-dark" style={{ width: 'calc(100% + 4rem)' }}>
                        <div>{formatCurrency.format(invertPrice ? current.price1 : current.price0)}</div>
                        <div className="text-sm font-semibold">Current Price</div>
                    </div>}
                    {
                        afterCurrent ? afterCurrent.map((v: any, idx: number) => <div id={`after-current-${idx}`} className={`relative flex items-center h-[25px] py-1 w-full`} onMouseOver={() => setHoveredIndex(-idx)} onMouseOut={() => setHoveredIndex(NOT_SELECTED)}>
                            <div className="absolute flex justify-evenly w-full">
                                <div className="w-full text-left -ml-12 text-green-500 font-semibold">{formatCurrency.format(invertPrice ? v.price1 : v.price0)}</div>
                                <div className="w-full">{formatCurrency.format(invertPrice ? v.tvlToken1 : v.tvlToken0)}</div>
                                <div className="w-full text-right pr-4">{formatCurrency.format(invertPrice ? v.tvlToken0 : v.tvlToken1)}</div>
                            </div>
                            <div
                                key={`after-price-${idx}`}
                                className={`h-[20px] ${-idx >= hoveredIndex && hoveredIndex !== NOT_SELECTED ? 'bg-blue-500/80' : ((v.tick >= (tickAfterSwap || NOT_SELECTED))) ? 'bg-yellow-600' : 'bg-green-800/40'} rounded-l-lg ml-auto`}
                                style={{ width: `${v.activeLiquidity * 100 / maxLiquidity}%` }}></div>
                        </div>) : null
                    }
                    {isTickOutside === -1 && <div className="flex items-center gap-2 py-1 w-full bg-yellow-600 mt-2 pl-4" style={{ width: 'calc(100% + 4rem)' }}>
                        <ArrowDownIcon size={18} />
                        <span>Price is outside the scope</span>
                    </div>}
                </div>

            </div>

        </div>

    </div>
}

const MarketDepthChartTooltip = ({
    currencyA,
    currencyB,
    tooltipData
}: any) => {

    if (!tooltipData) return null

    return <div className="flex flex-col gap-2 p-4 rounded-2xl bg-card border border-card-border">
        <div className="flex gap-4 justify-between">
            <div>{`Average Price:`}</div>
            <div>{formatCurrency.format(tooltipData.price)}</div>
        </div>
        <div className="flex gap-4 justify-between">
            <div>{`Amount ${currencyA?.symbol}:`}</div>
            <div>{formatCurrency.format(tooltipData.amount)}</div>
        </div>
        <div className="flex gap-4 justify-between">
            <div>{`Total ${currencyB?.symbol}:`}</div>
            <div>{formatCurrency.format(tooltipData.total)}</div>
        </div>
    </div>
}

export default MarketDepthChart
