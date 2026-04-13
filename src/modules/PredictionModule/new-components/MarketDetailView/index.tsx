import { usePool } from "@/hooks/pools/usePool";
import { useCurrency } from "@/hooks/common/useCurrency";
import { cn, formatAmount } from "@/utils";
import { ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { formatUnits } from "viem";
import { Chart } from "@/components/common/Chart";
import { CHART_SPAN, POOL_CHART_TYPE } from "@/types/swap-chart";
import { usePoolChartData } from "@/hooks/analytics";
import { PredictionChart } from "../../components/PredictionChart";
import { useMarketFiveMinuteData, useMarketStats } from "../../hooks";
import { PredictionMarket } from "../../types";
import { UserActivitySection } from "../UserActivitySection";
import { useAccount } from "wagmi";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useReadBinaryLmsrMarketManagerPriceNo, useReadBinaryLmsrMarketManagerPriceYes } from "@/generated";

interface MarketDetailViewProps {
    market: PredictionMarket;
    onBack: () => void;
}

export function MarketDetailView({ market, onBack }: MarketDetailViewProps) {
    const { address: account } = useAccount();
    const isGreater = market.condition === "greater";

    const [, pool] = usePool(market.pool);
    const marketCurrency = useCurrency(market.marketToken);
    const quoteCurrency = useCurrency(market.quoteToken);
    const quoteAmount = quoteCurrency ? formatUnits(BigInt(market.mark), quoteCurrency.decimals) : "0";

    const isLower = market.condition === "lower";

    // Check if market is closed
    const now = Date.now();
    const isMarketClosed = Number(market.plannedResolutionTimestamp) * 1000 <= now;
    const outcome = market.outcome; // 0 = unresolved, 1 = YES won, 2 = NO won
    const outcomeResolved = outcome === 1 || outcome === 2;
    const outcomeText = outcome === 1 ? "YES" : outcome === 2 ? "NO" : null;

    const { data: priceYes } = useReadBinaryLmsrMarketManagerPriceYes({ args: [market.index] });
    const { data: priceNo } = useReadBinaryLmsrMarketManagerPriceNo({ args: [market.index] });

    const yesPercent = priceYes ? Number(formatUnits(priceYes, 18)) * 100 : 50;
    const noPercent = priceNo ? Number(formatUnits(priceNo, 18)) * 100 : 50;

    const { tvl, volume, users, tradingDeadline } = useMarketStats(market);

    const [chartType, setChartType] = useState<"price" | "probability">("price");

    const dateRange = useMemo(() => {
        const start = new Date(Number(market.createdAt) * 1000);
        const end = new Date(Number(market.tradingDeadline) * 1000);

        const formatTime = (d: Date) => {
            const hours = d.getHours();
            const minutes = d.getMinutes();
            const ampm = hours >= 12 ? "PM" : "AM";
            const h = hours % 12 || 12;
            const m = minutes.toString().padStart(2, "0");
            return `${h}:${m}${ampm}`;
        };

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[start.getMonth()];
        const day = start.getDate();

        return `${month} ${day}, ${formatTime(start)}-${formatTime(end)} ET`;
    }, [market.createdAt, market.tradingDeadline]);

    const { data: marketFiveMinuteData, loading: isMarketDataLoading } = useMarketFiveMinuteData(market.id);
    const { chartData, loading: isChartDataLoading } = usePoolChartData(market.pool, CHART_SPAN.DAY, POOL_CHART_TYPE.PRICE);

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="bg-card gap-4 rounded-2xl border border-card-border">
                <div className="flex flex-col gap-4 p-4">
                    <button onClick={onBack} className="flex items-center gap-2">
                        <ChevronLeft size={16} className="text-text-300" />
                        <span className="text-xs text-text-300 uppercase tracking-wider">Market Details</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <CurrencyLogo currency={marketCurrency} size={48} />

                        <div className="flex flex-col gap-1 items-start">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white">
                                    Will {marketCurrency?.symbol}{" "}
                                    <span className={cn(isGreater ? "text-green-400" : "text-red-400")}>
                                        be {isGreater ? "greater" : "lower"} than
                                    </span>{" "}
                                    {formatAmount(quoteAmount, 6)} {quoteCurrency?.symbol}?
                                </h2>
                                <div className="flex items-center gap-3">
                                    {isMarketClosed ? (
                                        <div
                                            className={cn(
                                                "flex items-center gap-2 px-2 py-1 rounded-full border",
                                                outcomeResolved ? "bg-white/5 border-white/20" : "bg-yellow-500/10 border-yellow-500/30",
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "text-xs font-semibold uppercase tracking-wide",
                                                    outcomeResolved ? "text-white" : "text-yellow-400",
                                                )}
                                            >
                                                {outcomeResolved ? `Resolved: ${outcomeText}` : "Resolving..."}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                            </span>
                                            <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Live</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-sm text-text-300">{dateRange}</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 py-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-text-300">YES</span>
                            <span className="text-xl font-bold text-green-400">{yesPercent.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-red-400">{noPercent.toFixed(1)}%</span>
                            <span className="text-sm text-text-300">NO</span>
                        </div>
                    </div>

                    <div className="relative h-2.5 rounded-full bg-red-600/30 overflow-hidden mb-4">
                        <div
                            className="absolute left-0 top-0 h-full rounded-full bg-green-600 transition-all duration-600"
                            style={{ width: `${yesPercent}%` }}
                        />
                    </div>
                </div>

                <div className="relative grid grid-cols-4 px-4 py-4 mb-4 bg-card border-t border-b border-card-border">
                    <div className="flex flex-col items-start">
                        <div className="text-[11px] text-text-300 uppercase tracking-wider mb-1">TVL</div>
                        <div className="text-xl font-bold text-white tabular-nums">{tvl}</div>
                    </div>

                    <div className="flex flex-col items-start border-l border-card-border pl-4">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider mb-1">
                            <span>Volume</span>
                        </div>
                        <div className={cn("text-xl font-bold tabular-nums")}>{volume}</div>
                    </div>

                    <div className="flex flex-col items-start border-l border-card-border pl-4">
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider mb-1">
                            <span>Traders</span>
                        </div>
                        <div className={cn("text-xl font-bold tabular-nums")}>{users}</div>
                    </div>

                    <div className="flex flex-col items-start border-l border-card-border pl-4">
                        <div className="text-[11px] text-text-300 uppercase tracking-wider mb-1">Market resolves</div>

                        <div className="text-xl font-bold text-white tabular-nums">{tradingDeadline}</div>
                    </div>
                </div>

                {pool && (
                    <div className=" overflow-hidden relative">
                        <div className="flex items-center justify-between px-4 absolute top-0 left-0 right-0 z-10">
                            <div className="flex items-center gap-1 ml-auto rounded-lg bg-card-border/50 border border-card-border">
                                <button
                                    onClick={() => setChartType("price")}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                        chartType === "price" ? "bg-card text-white" : "text-text-300 hover:text-white",
                                    )}
                                >
                                    Price
                                </button>
                                <button
                                    onClick={() => setChartType("probability")}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                        chartType === "probability" ? "bg-card text-white" : "text-text-300 hover:text-white",
                                    )}
                                >
                                    Probability
                                </button>
                            </div>
                        </div>

                        <div className="min-h-[220px]">
                            {chartType === "price" ? (
                                <Chart
                                    chartData={chartData}
                                    chartSpan={CHART_SPAN.DAY}
                                    chartTitle={POOL_CHART_TYPE.PRICE}
                                    chartView={"line"}
                                    chartType={POOL_CHART_TYPE.PRICE}
                                    setChartType={() => {}}
                                    setChartSpan={() => {}}
                                    height={200}
                                    tokenA={marketCurrency?.symbol}
                                    tokenB={quoteCurrency?.symbol}
                                    isChartDataLoading={isChartDataLoading}
                                    showSpanSelector={false}
                                    prediction={isLower ? { lower: +quoteAmount } : { greater: +quoteAmount }}
                                />
                            ) : (
                                <PredictionChart
                                    lowerData={isLower ? marketFiveMinuteData : []}
                                    greaterData={isLower ? [] : marketFiveMinuteData}
                                    currentMarket={market.condition === "lower" ? "lower" : "greater"}
                                    loading={isMarketDataLoading}
                                />
                            )}
                        </div>
                    </div>
                )}

                {account && (
                    <div>
                        <div className="mb-2 text-left font-semibold p-4 pb-0">Your Activity</div>
                        <UserActivitySection marketId={market.id} />
                    </div>
                )}
            </div>
        </div>
    );
}
