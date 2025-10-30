import { useLayoutEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { CHART_SPAN, POOL_CHART_TYPE, CHART_VIEW, ChartSpanType, PoolChartTypeType } from "@/types/swap-chart";
import { usePool } from "@/hooks/pools/usePool";
import { Address, parseUnits } from "viem";
import { Chart } from "@/components/common/Chart";
import PageTitle from "@/components/common/PageTitle";
import { CurrenciesInfoHeader } from "@/components/common/CurrenciesInfoHeader";
import { formatAmount, formatPercent } from "@/utils";
import { Currency, CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Plus } from "lucide-react";
import { TransactionsList } from "../TransactionsList";
import { getPercentChange } from "@/utils/common/getPercentChange";
import { unwrappedToken } from "@/utils/common/unwrappedToken";
import { usePoolChartData } from "@/hooks/analytics";
import PageContainer from "@/components/common/PageContainer";

const LiquidityStats = ({
    token0,
    token1,
    statistics,
}: {
    token0: Currency | undefined;
    token1: Currency | undefined;
    statistics:
        | {
              volume24H: string;
              fees24H: string;
              tvlUSD: string;
              tvlToken0: string;
              tvlToken1: string;
              tvlPercentChange: number;
              volumePercentChange: number;
              feesPercentChange: number;
              txCount: string;
          }
        | undefined;
}) => {
    const { formatted: tvlToken0USD } = useUSDCValue(
        token0 && statistics?.tvlToken0
            ? CurrencyAmount.fromRawAmount(token0, parseUnits(statistics.tvlToken0, token0.decimals).toString())
            : undefined
    );
    const { formatted: tvlToken1USD } = useUSDCValue(
        token1 && statistics?.tvlToken1
            ? CurrencyAmount.fromRawAmount(token1.wrapped, parseUnits(statistics.tvlToken1, token1.decimals).toString())
            : undefined
    );

    return (
        <div className="flex flex-col gap-3 h-fit">
            <div className="flex flex-col w-full items-start bg-card rounded-xl border border-card-border p-4 h-fit">
                <h2 className="font-semibold mb-2">Pool Liquidity</h2>
                <p className="text-2xl font-bold mb-3">${formatAmount(statistics?.tvlUSD || 0, 4)}</p>
                <div className="flex flex-col gap-3 items-start w-full">
                    <h3 className="text-text-100/50">Tokens</h3>
                    <div className="flex items-center w-full justify-between">
                        <div className="flex items-center gap-2">
                            <CurrencyLogo currency={token0} size={24} />
                            <span>{token0?.symbol}</span>
                        </div>
                        <span className="font-semibold">
                            {formatAmount(statistics?.tvlToken0 || 0, 4)}{" "}
                            <span className="text-text-100/50 font-medium text-xs">${formatAmount(tvlToken0USD || 0, 2)}</span>
                        </span>
                    </div>
                    <div className="flex items-center w-full justify-between">
                        <div className="flex items-center gap-2">
                            <CurrencyLogo currency={token1} size={24} />
                            <span>{token1?.symbol}</span>
                        </div>
                        <span className="font-semibold">
                            {formatAmount(statistics?.tvlToken1 || 0, 4)}{" "}
                            <span className="text-text-100/50 font-medium text-xs">${formatAmount(tvlToken1USD || 0, 2)}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-full items-start bg-card border border-card-border rounded-xl p-4 h-fit">
                <h2 className="font-semibold mb-4">Statistics</h2>
                <div className="flex flex-col gap-3 w-full">
                    <div className="flex justify-between">
                        <span className="text-text-100/50">Liquidity</span>
                        <span className="font-semibold">
                            ${formatAmount(statistics?.tvlUSD || 0, 2)}{" "}
                            <span className={`text-xs ${(statistics?.tvlPercentChange || 0) > 0 ? "text-green-400" : "text-red-400"}`}>
                                <span>{(statistics?.tvlPercentChange || 0) > 0 ? "+" : ""}</span>
                                <span>{formatPercent.format((statistics?.tvlPercentChange || 0) / 100)}</span>
                            </span>
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-100/50">Volume (24h)</span>
                        <span className="font-semibold">
                            ${formatAmount(statistics?.volume24H || 0, 2)}{" "}
                            <span className={`text-xs ${(statistics?.volumePercentChange || 0) > 0 ? "text-green-400" : "text-red-400"}`}>
                                <span>{(statistics?.volumePercentChange || 0) > 0 ? "+" : ""}</span>
                                <span>{formatPercent.format((statistics?.volumePercentChange || 0) / 100)}</span>
                            </span>
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-100/50">Fees (24h)</span>
                        <span className="font-semibold">
                            ${formatAmount(statistics?.fees24H || 0, 2)}{" "}
                            <span
                                className={`text-xs font-medium ${
                                    (statistics?.feesPercentChange || 0) > 0 ? "text-green-400" : "text-red-400"
                                }`}
                            >
                                <span>{(statistics?.feesPercentChange || 0) > 0 ? "+" : ""}</span>
                                <span>{formatPercent.format((statistics?.feesPercentChange || 0) / 100)}</span>
                            </span>
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-100/50">Transactions</span>
                        <span className="font-semibold">{formatAmount(statistics?.txCount || 0, 2)} </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function AnalyticsPoolPage() {
    const { poolId } = useParams();
    const { pathname } = useLocation();

    const [type, setType] = useState<PoolChartTypeType>(POOL_CHART_TYPE.TVL);
    const [span, setSpan] = useState<ChartSpanType>(CHART_SPAN.MONTH);

    const [, pool] = usePool(poolId as Address);

    const { token0, token1 } = pool
        ? {
              token0: unwrappedToken(pool.token0),
              token1: unwrappedToken(pool.token1),
          }
        : {};

    const { poolDayDatas, chartData, loading: isChartDataLoading } = usePoolChartData(poolId, span, type);

    const statistics = useMemo(() => {
        if (!poolDayDatas[0]) return undefined;

        const currentPoolData = poolDayDatas[poolDayDatas.length - 1];
        const prevPoolData = poolDayDatas[poolDayDatas.length - 2];

        return {
            volume24H: currentPoolData.volumeUSD,
            fees24H: currentPoolData.feesUSD,
            tvlUSD: currentPoolData.tvlUSD,
            tvlToken0: currentPoolData.pool.totalValueLockedToken0,
            tvlToken1: currentPoolData.pool.totalValueLockedToken1,
            tvlPercentChange: getPercentChange(Number(currentPoolData.tvlUSD), Number(prevPoolData?.tvlUSD || 0)),
            volumePercentChange: getPercentChange(Number(currentPoolData.volumeUSD), Number(prevPoolData?.volumeUSD || 0)),
            feesPercentChange: getPercentChange(Number(currentPoolData.feesUSD), Number(prevPoolData?.feesUSD || 0)),
            txCount: currentPoolData.pool.txCount,
        };
    }, [poolDayDatas]);

    const chartView = useMemo(() => {
        switch (type) {
            case POOL_CHART_TYPE.TVL:
                return CHART_VIEW.AREA;
            case POOL_CHART_TYPE.VOLUME:
                return CHART_VIEW.BAR;
            case POOL_CHART_TYPE.FEES:
                return CHART_VIEW.BAR;
            case POOL_CHART_TYPE.PRICE:
                return CHART_VIEW.LINE;
            // case POOL_CHART_TYPE.APR:
            //     return CHART_VIEW.LINE;
            default:
                return CHART_VIEW.AREA;
        }
    }, [type]);

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <PageContainer>
            <div className="mb-8">
                <PageTitle title="Explore pool" showSettings={false} />
            </div>
            <div className="grid grid-cols-1 gap-3 w-full md:grid-cols-3">
                <div className="md:col-span-2 bg-card border border-card-border rounded-xl p-3">
                    <div className="flex flex-col p-3 gap-6 border-b border-card-border mb-4">
                        <CurrenciesInfoHeader tokenA={token0} tokenB={token1} />
                    </div>

                    <Chart
                        chartData={chartData}
                        chartSpan={span}
                        chartTitle={type}
                        chartView={chartView}
                        chartType={type}
                        setChartType={setType}
                        setChartSpan={setSpan}
                        showTypeSelector
                        height={260}
                        tokenA={token0?.symbol}
                        tokenB={token1?.symbol}
                        isChartDataLoading={isChartDataLoading}
                    />
                </div>
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Link className="col-span-1 w-full " to={"/swap"}>
                            <Button variant={"primary"} size={"lg"} className="gap-2 rounded-xl w-full h-full max-md:text-sm">
                                <ArrowDownUp size={20} />
                                Trade
                            </Button>
                        </Link>
                        <Link className="col-span-1 w-full" to={`/pool/${poolId}/new-position`}>
                            <Button variant={"primaryLink"} size={"lg"} className="gap-2 rounded-xl">
                                <Plus size={20} />
                                Create Position
                            </Button>
                        </Link>
                    </div>
                    <LiquidityStats token0={token0} token1={token1} statistics={statistics} />
                </div>
            </div>

            <div className="pb-5 bg-card border border-card-border/60 rounded-xl w-full mt-4">
                <TransactionsList poolId={poolId} />
            </div>
        </PageContainer>
    );
}
