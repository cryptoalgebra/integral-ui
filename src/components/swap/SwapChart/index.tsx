import { IDerivedSwapInfo } from "@/state/swapStore";
// import { CurrenciesInfoHeader } from "@/components/common/CurrenciesInfoHeader";
import { useMemo, useState } from "react";
import { CHART_SPAN, CHART_VIEW, ChartSpanType, POOL_CHART_TYPE } from "@/types/swap-chart";
import { computePoolAddress } from "@cryptoalgebra/custom-pools-sdk";
import { Chart } from "@/components/common/Chart";
import { PoolState, usePool } from "@/hooks/pools/usePool";
import { Address } from "viem";
import { BarChart3Icon } from "lucide-react";
import { usePoolChartData } from "@/hooks/analytics";

const SwapChart = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const { currencies } = derivedSwap;
    const [tokenA, tokenB] = [currencies.INPUT, currencies.OUTPUT];

    const [span, setSpan] = useState<ChartSpanType>(CHART_SPAN.MONTH);

    const poolId = useMemo(() => {
        if (!tokenA || !tokenB) return undefined;
        if (tokenA.wrapped.equals(tokenB.wrapped)) return undefined;
        return computePoolAddress({
            tokenA: tokenA.wrapped,
            tokenB: tokenB.wrapped,
        });
    }, [tokenA, tokenB]);

    const [poolStateType] = usePool(poolId as Address);
    const isPoolExists = poolStateType === PoolState.EXISTS;

    const isSorted = tokenA && tokenB ? tokenA.wrapped.equals(tokenB.wrapped) ? undefined : tokenA.wrapped.sortsBefore(tokenB.wrapped) : undefined;

    const { chartData, loading: isLoading } = usePoolChartData(poolId, span, POOL_CHART_TYPE.PRICE, isSorted);

    const chartView = CHART_VIEW.LINE;

    return (
        <div className="flex flex-col px-3 w-full h-full min-h-fit relative rounded-xl">
            {/* <div className="flex flex-col px-4 pt-4 pb-0 gap-6">
                <CurrenciesInfoHeader tokenA={tokenA} tokenB={tokenB} />
                <hr className="border" />
            </div> */}
            {isPoolExists ? (
                <Chart
                    chartData={chartData}
                    chartSpan={span}
                    chartTitle={POOL_CHART_TYPE.PRICE}
                    chartView={chartView}
                    chartType={POOL_CHART_TYPE.PRICE}
                    setChartType={() => null}
                    setChartSpan={setSpan}
                    showTypeSelector={false}
                    height={260}
                    tokenA={tokenA?.symbol}
                    tokenB={tokenB?.symbol}
                    isChartDataLoading={isLoading}
                    fadeOut
                />
            ) : (
                <div className="w-full h-full flex flex-col gap-4 items-center justify-center">
                    <BarChart3Icon size={42} />
                    Chart coming soon...
                </div>
            )}
        </div>
    );
};

export default SwapChart;
