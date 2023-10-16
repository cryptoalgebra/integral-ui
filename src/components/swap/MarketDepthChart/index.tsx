import { MAX_UINT128 } from "@/constants/max-uint128";
import { useInfoTickData } from "@/hooks/pools/usePoolTickData";
import { Currency, CurrencyAmount, INITIAL_POOL_FEE, Pool, TickMath, Token } from "@cryptoalgebra/integral-sdk"
import { useEffect, useMemo, useState } from "react";
import { Address } from "wagmi";

interface MarketDepthChartProps {
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    poolAddress: Address | undefined;
    isOpen: boolean;
}

const MarketDepthChart = ({ currencyA, currencyB, isOpen }: MarketDepthChartProps) => {

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
                            ? new Pool(currencyA.wrapped, currencyB.wrapped, INITIAL_POOL_FEE, sqrtPriceX96, t.liquidityActive.toString(), t.tickIdx, ticksResult.tickSpacing, mockTicks)
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

        return [slicedData.slice(0, currentIdx), slicedData[currentIdx], slicedData.slice(currentIdx), maxLiquidity]
    }, [processedData])

    return <div className={`h-full bg-card fixed border-l border-card-border right-0 top-0 duration-200`} style={{width: isOpen ? '250px' : '0px'}}>
        <div>Market depth</div>

        <div className="flex flex-col items-end w-full h-full pl-8 overflow-auto">

            {
                beforeCurrent ? beforeCurrent.map((v: any) => <div className={`h-[30px] bg-red-500`} style={{ width: `${v.activeLiquidity * 100 / maxLiquidity}%` }}>{v.price0}</div>) : null
            }
            {current && <div className="h-[40px] w-full bg-yellow-500">CURRENT</div>}
            {
                afterCurrent ? afterCurrent.map((v: any) => <div className={`h-[30px] bg-blue-500`} style={{ width: `${v.activeLiquidity * 100 / maxLiquidity}%` }}>{v.price0}</div>) : null
            }
        </div>

        {/* <div className="h-[500px]">
        <LiquidityChart 
            currencyA={currencyA} 
            currencyB={currencyB} 
            currentPrice={price ? parseFloat(price.toSignificant()) : undefined} 
            priceLower={price || undefined} 
            priceUpper={price || undefined} 
            />
            </div> */}
    </div>

}

export default MarketDepthChart