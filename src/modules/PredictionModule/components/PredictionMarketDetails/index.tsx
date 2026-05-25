import { usePool } from "@/hooks/pools/usePool";
import { useCurrency } from "@/hooks/common/useCurrency";
import { cn, formatAmount } from "@/utils";
import { ChevronLeft, Check, X, ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { formatUnits } from "viem";
import { PredictionChart } from "../../components/PredictionChart";
import { useMarketFiveMinuteData, useMarketStats, useSwapPriceHistory } from "../../hooks";
import { PredictionMarket } from "../../types";
import { UserActivitySection } from "../UserActivitySection";
import { useAccount } from "wagmi";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useReadBinaryLmsrMarketManagerPriceNo, useReadBinaryLmsrMarketManagerPriceYes } from "@/generated";
import { useNow } from "@/hooks/common/useNow";
import { Link } from "react-router-dom";
import { LivePriceChart } from "../LivePriceChart";

interface PredictionMarketDetailsProps {
    market: PredictionMarket;
    onBack: () => void;
}

export function PredictionMarketDetails({ market, onBack }: PredictionMarketDetailsProps) {
    const { address: account } = useAccount();
    const isGreater = market.condition === "greater";

    const [, pool] = usePool(market.pool);
    const marketCurrency = useCurrency(market.marketToken);
    const quoteCurrency = useCurrency(market.quoteToken);
    const quoteAmount = quoteCurrency ? formatUnits(BigInt(market.mark), quoteCurrency.decimals) : "0";

    const targetPrice = useMemo(() => {
        if (!quoteCurrency) return 0;
        return Number(formatUnits(BigInt(market.mark), quoteCurrency.decimals));
    }, [market.mark, quoteCurrency]);

    const { priceHistory, currentPrice } = useSwapPriceHistory(market.pool, marketCurrency, quoteCurrency);

    const isLower = market.condition === "lower";

    // Check if market is closed
    const now = useNow();
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
            const hours = d
                .getHours()
                .toString()
                .padStart(2, "0");
            const minutes = d
                .getMinutes()
                .toString()
                .padStart(2, "0");
            return `${hours}:${minutes}`;
        };

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const startMonth = monthNames[start.getMonth()];
        const startDay = start.getDate();

        const isSameDay =
            start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate();

        const endLabel = isSameDay ? formatTime(end) : `${monthNames[end.getMonth()]} ${end.getDate()}, ${formatTime(end)}`;

        return `${startMonth} ${startDay}, ${formatTime(start)} — ${endLabel}`;
    }, [market.createdAt, market.tradingDeadline]);

    const { data: marketFiveMinuteData, loading: isMarketDataLoading } = useMarketFiveMinuteData(market.id);

    const [tab, setTab] = useState<"rules" | "activity">("rules");

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
                                <>
                                    <div className="text-title flex flex-col items-start text-left px-4 mb-2">
                                        <div className="mb-2 font-semibold text-left">Price</div>
                                        <div className="mb-2 text-xl font-semibold">
                                            1 {marketCurrency?.symbol} = {formatAmount(currentPrice || 0, 6)} {quoteCurrency?.symbol}
                                        </div>
                                    </div>
                                    <LivePriceChart
                                        priceHistory={priceHistory}
                                        targetPrice={targetPrice}
                                        currentPrice={currentPrice}
                                        height={250}
                                    />
                                </>
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

                <div className="flex flex-col gap-0 border-t border-card-border">
                    <div className="flex items-center gap-2 px-4 pt-4">
                        <button
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                                tab === "rules"
                                    ? "bg-card-border border-card-border text-white"
                                    : "bg-card-dark border-card-border text-text-300 hover:text-white",
                            )}
                            onClick={() => setTab("rules")}
                        >
                            Rules
                        </button>
                        <button
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                                tab === "activity"
                                    ? "bg-card-border border-card-border text-white"
                                    : "bg-card-dark border-card-border text-text-300 hover:text-white",
                            )}
                            onClick={() => setTab("activity")}
                        >
                            Activity
                        </button>
                    </div>
                    <div className="p-4">
                        {tab === "rules" && (
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col items-start">
                                    <div className="text-sm font-semibold text-white mb-2">Description</div>
                                    <div className="bg-card-light rounded-xl p-4 text-sm text-text-200 w-full text-left">
                                        This market predicts whether the {marketCurrency?.symbol}/{quoteCurrency?.symbol} 5-minute TWAP at{" "}
                                        {dateRange.split("—")[1]?.trim() || "—"} will be {isGreater ? "above" : "below"}{" "}
                                        {formatAmount(quoteAmount, 6)}.
                                    </div>
                                </div>

                                <div className="flex flex-col items-start">
                                    <div className="text-sm font-semibold text-white mb-2 ">Rules</div>
                                    <div className="bg-card-light rounded-xl p-4 text-sm text-text-200 leading-relaxed w-full text-left">
                                        A qualifying event is the {marketCurrency?.symbol}/{quoteCurrency?.symbol} price in the Algebra pool
                                        at the resolution time. The resolution price is calculated as a 5-minute time-weighted average price
                                        (TWAP) from the pool. YES if the TWAP is strictly {isGreater ? "above" : "below"}{" "}
                                        {formatAmount(quoteAmount, 6)} {quoteCurrency?.symbol}. NO if it is{" "}
                                        {isGreater
                                            ? `${formatAmount(quoteAmount, 6)} or lower`
                                            : `${formatAmount(quoteAmount, 6)} or higher`}
                                        . Off-chain prices, oracle feeds, and other external sources do not count.
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-green-600/30 bg-green-600/5 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center">
                                                <Check size={18} className="text-green-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-green-600">Resolves YES if</span>
                                        </div>
                                        <div className="text-sm text-text-200 text-left">
                                            - The 5-min TWAP is {isGreater ? "above" : "below"} {formatAmount(quoteAmount, 6)} at the
                                            resolution time.
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-red-600/30 bg-red-600/5 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                                                <X size={18} className="text-red-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-red-600">Resolves NO if</span>
                                        </div>
                                        <div className="text-sm text-text-200 text-left">
                                            - The 5-min TWAP is{" "}
                                            {isGreater
                                                ? `${formatAmount(quoteAmount, 6)} or lower`
                                                : `${formatAmount(quoteAmount, 6)} or higher`}{" "}
                                            at the resolution time.
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start">
                                    <div className="text-sm font-semibold text-white mb-2 ">Resolution source</div>
                                    <div className="bg-card-light rounded-xl p-4 text-sm text-text-200 leading-relaxed w-full text-left">
                                        <Link
                                            to={`/pool/${market.pool}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-200 hover:underline inline-flex items-center gap-1"
                                        >
                                            Pool {marketCurrency?.symbol}/{quoteCurrency?.symbol} <ArrowUpRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                        {tab === "activity" && account && (
                            <div>
                                <div className="text-sm font-semibold text-white mb-2 text-left">Your activity</div>
                                <UserActivitySection marketId={market.id} />
                            </div>
                        )}
                        {tab === "activity" && !account && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-sm text-text-300">Connect your wallet to see your activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
