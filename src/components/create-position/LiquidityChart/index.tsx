import { useInfoTickData } from "@/hooks/pools/usePoolTickData";
import { useMintState } from "@/state/mintStore";
import { Presets } from "@/types/presets";
import { CurrencyAmount, INITIAL_POOL_FEE, Pool, Token, TickMath, Price, Currency, ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { useEffect, useMemo, useState } from "react";
import { Chart } from "./chart";
import { Skeleton } from "@/components/ui/skeleton";
import { maxUint128 } from "viem";

interface LiquidityChartProps {
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    pool: Pool | null | undefined;
    currentPrice: number | undefined;
    priceLower: Price<Currency, Currency> | undefined;
    priceUpper: Price<Currency, Currency> | undefined;
}

// const ZOOM_STEP = 5

const LiquidityChart = ({ currencyA, currencyB, pool, currentPrice, priceLower, priceUpper }: LiquidityChartProps) => {
    const { preset } = useMintState();

    const [processedData, setProcessedData] = useState<any>(null);

    const [zoom, setZoom] = useState(50);

    const {
        fetchTicksSurroundingPrice: { ticksResult, fetchTicksSurroundingPrice },
    } = useInfoTickData();

    useEffect(() => {
        if (!pool) return;
        fetchTicksSurroundingPrice(pool);
    }, [pool]);

    useEffect(() => {
        if (!ticksResult || !ticksResult.ticksProcessed) return;

        async function processTicks() {
            if (!ticksResult) return;

            const _data = await Promise.all(
                ticksResult.ticksProcessed.map(async (t, i) => {
                    const active = t.tickIdx === ticksResult.activeTickIdx;
                    const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(t.tickIdx);
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
                    ];
                    const pool =
                        currencyA && currencyB
                            ? new Pool(
                                  currencyA.wrapped,
                                  currencyB.wrapped,
                                  INITIAL_POOL_FEE,
                                  sqrtPriceX96,
                                  ADDRESS_ZERO,
                                  t.liquidityActive.toString(),
                                  t.tickIdx,
                                  ticksResult.tickSpacing,
                                  mockTicks
                              )
                            : undefined;

                    const nextSqrtX96 = ticksResult.ticksProcessed[i - 1]
                        ? TickMath.getSqrtRatioAtTick(ticksResult.ticksProcessed[i - 1].tickIdx)
                        : undefined;

                    const maxAmountToken0 = currencyA ? CurrencyAmount.fromRawAmount(currencyA.wrapped, maxUint128.toString()) : undefined;

                    const outputRes0 = pool && maxAmountToken0 ? await pool.getOutputAmount(maxAmountToken0, nextSqrtX96) : undefined;

                    const token1Amount = outputRes0?.[0] as CurrencyAmount<Token> | undefined;

                    const amount0 = token1Amount ? parseFloat(token1Amount.toExact()) * parseFloat(t.price1) : 0;
                    const amount1 = token1Amount ? parseFloat(token1Amount.toExact()) : 0;

                    return {
                        index: i,
                        isCurrent: active,
                        activeLiquidity: parseFloat(t.liquidityActive.toString()),
                        price0: t.price0,
                        price1: t.price1,
                        tvlToken0: amount0,
                        tvlToken1: amount1,
                    };
                })
            );
            setProcessedData(_data);
        }

        processTicks();
    }, [ticksResult]);

    useEffect(() => {
        if (preset === null) return;
        switch (preset) {
            case Presets.FULL:
                setZoom(10);
                break;
            case Presets.NORMAL:
                setZoom(25);
                break;
            case Presets.RISK:
                setZoom(30);
                break;
            case Presets.SAFE:
                setZoom(15);
                break;
            case Presets.STABLE:
                setZoom(40);
                break;
        }
    }, [preset]);

    const formattedData = useMemo(() => {
        if (!processedData) return undefined;
        if (processedData && processedData.length === 0) return undefined;

        const middle = Math.round(processedData.length / 2);
        const chunkLength = Math.round(processedData.length / zoom);

        const slicedData = processedData.slice(middle - chunkLength, middle + chunkLength);

        return slicedData.reverse();
    }, [processedData, zoom]);

    const isSorted = Boolean(currencyA && currencyB && currencyA?.wrapped.sortsBefore(currencyB?.wrapped));

    const leftPrice = useMemo(() => {
        return isSorted ? priceLower?.toSignificant(18) : priceUpper?.invert().toSignificant(18);
    }, [isSorted, priceLower, priceUpper]);

    const rightPrice = useMemo(() => {
        return isSorted ? priceUpper?.toSignificant(18) : priceLower?.invert().toSignificant(18);
    }, [isSorted, priceLower, priceUpper]);

    // const isZoomMin = zoom - ZOOM_STEP <= 10
    // const isZoomMax = zoom + ZOOM_STEP > 40

    // const handleZoomIn = () => setZoom((zoom) => zoom + ZOOM_STEP)
    // const handleZoomOut = () => setZoom((zoom) => zoom - ZOOM_STEP)

    return (
        <div className="flex w-full h-full">
            {formattedData ? (
                <Chart
                    formattedData={formattedData}
                    leftPrice={leftPrice}
                    rightPrice={rightPrice}
                    currentPrice={currentPrice}
                    isSorted={isSorted}
                    zoom={zoom}
                    currencyA={currencyA}
                    currencyB={currencyB}
                />
            ) : (
                <LiquidityChartLoader />
            )}
        </div>
    );
};

const LiquidityChartLoader = () => {
    const heights = [
        100, 110, 140, 110, 100, 140, 180, 120, 110, 100, 120, 100, 170, 170, 110, 100, 120, 100, 100, 110, 140, 110, 100, 140, 100, 120,
        100, 100, 110, 140, 110, 100, 140,
    ];

    return (
        <div className="flex items-end gap-2 pb-4 w-full h-[250px]">
            {heights.map((h, i) => (
                <Skeleton style={{ height: `${h}px` }} key={i} className="w-[20px] bg-card-dark" />
            ))}
        </div>
    );
};
export default LiquidityChart;
