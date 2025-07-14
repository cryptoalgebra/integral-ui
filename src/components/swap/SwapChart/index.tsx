import { useDerivedSwapInfo } from "@/state/swapStore";
import { CurrenciesInfoHeader } from "@/components/common/CurrenciesInfoHeader";
import { useMemo, useState } from "react";
import { CHART_SPAN, CHART_VIEW, ChartSpanType, POOL_CHART_TYPE } from "@/types/swap-chart";
import { computeCustomPoolAddress } from "@cryptoalgebra/custom-pools-sdk";
import { Chart } from "@/components/common/Chart";
import { CUSTOM_POOL_DEPLOYER_ADDRESSES } from "config/custom-pool-deployer";
import { useChainId } from "wagmi";
import { PoolState, usePool } from "@/hooks/pools/usePool";
import { Address } from "viem";
import { BarChart3Icon } from "lucide-react";
import { usePoolChartData } from "@/hooks/analytics";

const SwapChart = () => {
    const chainId = useChainId();
    const { currencies } = useDerivedSwapInfo();

    const [tokenA, tokenB] = [currencies.INPUT, currencies.OUTPUT];

    const [span, setSpan] = useState<ChartSpanType>(CHART_SPAN.DAY);

    const poolId = useMemo(() => {
        if (!tokenA || !tokenB) return undefined;
        return computeCustomPoolAddress({
            tokenA: tokenA.wrapped,
            tokenB: tokenB.wrapped,
            customPoolDeployer: CUSTOM_POOL_DEPLOYER_ADDRESSES.BASE[chainId],
        });
    }, [tokenA, tokenB, chainId]);

    const [poolStateType] = usePool(poolId as Address);
    const isPoolExists = poolStateType === PoolState.EXISTS;

    const isSorted = tokenA && tokenB && tokenA.wrapped.sortsBefore(tokenB.wrapped);

    const { chartData, loading: isLoading } = usePoolChartData(poolId, span, POOL_CHART_TYPE.PRICE, isSorted);

    const chartView = CHART_VIEW.LINE;

    return (
        <div className="flex flex-col p-3 w-full h-full min-h-fit relative rounded-xl bg-card border-card-border">
            <div className="flex flex-col px-4 pt-4 pb-0 gap-6">
                <CurrenciesInfoHeader tokenA={tokenA} tokenB={tokenB} />
                <hr className="border" />
            </div>
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
