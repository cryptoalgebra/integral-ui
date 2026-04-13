import CurrencyLogo from "@/components/common/CurrencyLogo";
import PageContainer from "@/components/common/PageContainer";
import { usePool } from "@/hooks/pools/usePool";
import { cn } from "@/utils";
import { ChevronLeft, Clock, DollarSign, Users2, BarChart, PauseCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Address, formatUnits } from "viem";
import { Chart } from "@/components/common/Chart";
import { CHART_SPAN, POOL_CHART_TYPE } from "@/types/swap-chart";
import { usePoolChartData } from "@/hooks/analytics";
import { useAccount } from "wagmi";

import PredictionModule from "@/modules/PredictionModule";
const { LiveChip, PredictionSideSelector, PredictionChart, PredictionInfo } = PredictionModule.components;
const { useSingleMarket, useUserPositionByMarket, useMarketStats, useMarketFiveMinuteData } = PredictionModule.hooks;

const PredictionMarketPage = () => {
    const [searchParams] = useSearchParams();
    const returnLink = searchParams.get("from") as "yes" | "no";

    const { market: marketAddress } = useParams() as { market: Address };

    const { address: account } = useAccount();

    const { data: market } = useSingleMarket(marketAddress);
    const { data: userPosition } = useUserPositionByMarket(account, marketAddress);

    const [action, setAction] = useState<"buy" | "sell">("buy");

    const [, pool] = usePool(market?.pool);

    const marketCurrency = market ? (market.marketToken === 0 ? pool?.token0 : pool?.token1) : undefined;
    const quoteCurrency = market ? (market.marketToken === 0 ? pool?.token1 : pool?.token0) : undefined;

    const displaySymbol = marketCurrency?.symbol === "WETH" ? "ETH" : marketCurrency?.symbol;

    const formattedCondition =
        quoteCurrency && market
            ? ((value) => (value < 1 ? value.toPrecision(4) : value.toFixed(0)))(
                  Number(formatUnits(BigInt(market.mark), quoteCurrency.decimals)),
              )
            : 0;

    const { tvl, volume, users, tradingDeadline, resolutionDate } = useMarketStats(market);

    const isLower = market?.condition === "lower";
    const isOpen = market && Number(market.tradingDeadline) * 1000 > Date.now();

    const isOneHourMarket = Boolean(market && Number(market.plannedResolutionTimestamp) - Number(market.createdAt) <= 3600 * 4);

    const [chartType, setChartType] = useState<"price" | "probability">("price");

    const { data: marketFiveMinuteData, loading: isMarketDataLoading } = useMarketFiveMinuteData(market?.id);
    const { chartData, loading: isChartDataLoading } = usePoolChartData(market?.pool, CHART_SPAN.DAY, POOL_CHART_TYPE.PRICE);

    console.log("chart data", chartData);

    if (!market) return;

    return (
        <PageContainer>
            {/* Hero Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Link
                        to={{ pathname: `/${returnLink || "prediction"}` }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft size={20} className="text-text-200" />
                    </Link>
                    {isOpen && <LiveChip showDot={isOneHourMarket} targetDate={+market.plannedResolutionTimestamp * 1000} />}
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <CurrencyLogo currency={marketCurrency} size={48} />
                            <div
                                className={cn(
                                    "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center",
                                    isLower ? "bg-red-500/20" : "bg-green-500/20",
                                )}
                            >
                                {isLower ? (
                                    <TrendingDown size={14} className="text-red-400" />
                                ) : (
                                    <TrendingUp size={14} className="text-green-400" />
                                )}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                {displaySymbol} {isLower ? "Below" : "Above"} {formattedCondition}
                            </h1>
                            <p className="text-text-300 text-sm mt-1">
                                {quoteCurrency?.symbol} pair • Resolves {resolutionDate}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 grid-cols-1 w-full gap-4 mb-8">
                {/* Trading Panel */}
                <div className="flex flex-col gap-4 col-span-1 w-full">
                    <div className="rounded-2xl bg-card-dark border border-card-border overflow-hidden">
                        {/* Buy/Sell tabs */}
                        <div className="flex border-b border-card-border/50">
                            <button
                                className={cn(
                                    "flex-1 py-3 text-sm font-semibold transition-all relative",
                                    action === "buy" ? "text-white" : "text-text-300 hover:text-white",
                                )}
                                onClick={() => setAction("buy")}
                            >
                                Buy
                                {action === "buy" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                            </button>
                            <button
                                className={cn(
                                    "flex-1 py-3 text-sm font-semibold transition-all relative",
                                    action === "sell" ? "text-white" : "text-text-300 hover:text-white",
                                )}
                                onClick={() => setAction("sell")}
                            >
                                Sell
                                {action === "sell" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                            </button>
                        </div>

                        {/* Side selector */}
                        <div className="p-4">
                            <PredictionSideSelector
                                market={market}
                                action={action}
                                isOneHourMarket={isOneHourMarket}
                                userPosition={userPosition}
                            />
                        </div>
                    </div>

                    {/* Market Stats */}
                    {market && (
                        <div className="rounded-2xl bg-card-dark border border-card-border p-4">
                            <h3 className="text-xs font-semibold text-text-300 uppercase tracking-wider mb-3">Market Details</h3>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-text-200">
                                        <PauseCircle size={14} className="text-text-300" />
                                        <span className="text-sm">Trading ends</span>
                                    </div>
                                    <span className="text-sm text-white font-medium">{tradingDeadline}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-text-200">
                                        <Clock size={14} className="text-text-300" />
                                        <span className="text-sm">Resolves</span>
                                    </div>
                                    <span className="text-sm text-white font-medium">{resolutionDate}</span>
                                </div>
                                <div className="h-px bg-card-border/50 my-1" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-text-200">
                                        <DollarSign size={14} className="text-text-300" />
                                        <span className="text-sm">TVL</span>
                                    </div>
                                    <span className="text-sm text-white font-medium">{tvl}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-text-200">
                                        <BarChart size={14} className="text-text-300" />
                                        <span className="text-sm">Volume</span>
                                    </div>
                                    <span className="text-sm text-white font-medium">${volume}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-text-200">
                                        <Users2 size={14} className="text-text-300" />
                                        <span className="text-sm">Participants</span>
                                    </div>
                                    <span className="text-sm text-white font-medium">{users}</span>
                                </div>
                            </div>

                            {/* Info text */}
                            <div className="mt-4 pt-4 border-t border-card-border/50">
                                <p className="text-xs text-text-300 leading-relaxed">
                                    Final price taken at resolve time ({resolutionDate}). Source:{" "}
                                    {pool?.token0.symbol === "WETH" ? "ETH" : pool?.token0.symbol}/{pool?.token1.symbol} pool.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chart Section */}
                <div className="flex flex-col gap-4 col-span-2">
                    <div className="rounded-2xl bg-card-dark border border-card-border p-4">
                        {/* Chart type toggle */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-white">{chartType === "price" ? "Price History" : "Probability"}</h3>
                            <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
                                <button
                                    onClick={() => setChartType("price")}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                        chartType === "price" ? "bg-white/10 text-white" : "text-text-300 hover:text-white",
                                    )}
                                >
                                    Price
                                </button>
                                <button
                                    onClick={() => setChartType("probability")}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                        chartType === "probability" ? "bg-white/10 text-white" : "text-text-300 hover:text-white",
                                    )}
                                >
                                    Chance
                                </button>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="min-h-[280px]">
                            {chartType === "price" ? (
                                <Chart
                                    chartData={chartData}
                                    chartSpan={CHART_SPAN.DAY}
                                    chartTitle={POOL_CHART_TYPE.PRICE}
                                    chartView={"line"}
                                    chartType={POOL_CHART_TYPE.PRICE}
                                    setChartType={() => {}}
                                    setChartSpan={() => {}}
                                    height={260}
                                    tokenA={marketCurrency?.symbol}
                                    tokenB={quoteCurrency?.symbol}
                                    isChartDataLoading={isChartDataLoading}
                                    showSpanSelector={false}
                                    prediction={
                                        market ? (isLower ? { lower: +formattedCondition } : { greater: +formattedCondition }) : undefined
                                    }
                                />
                            ) : (
                                <PredictionChart
                                    pool={pool}
                                    lowerMarket={isLower ? market : undefined}
                                    greaterMarket={isLower ? undefined : market}
                                    lowerData={isLower ? marketFiveMinuteData : []}
                                    greaterData={isLower ? [] : marketFiveMinuteData}
                                    currentMarket={market?.condition === "lower" ? "lower" : "greater"}
                                    changeMarket={() => {}}
                                    loading={isMarketDataLoading}
                                />
                            )}
                        </div>
                    </div>

                    {/* Market Info */}
                    {market && (
                        <div className="rounded-2xl bg-card-dark border border-card-border p-4">
                            <PredictionInfo market={market} />
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default PredictionMarketPage;
