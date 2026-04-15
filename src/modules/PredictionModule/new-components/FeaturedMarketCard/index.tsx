import { useCurrency } from "@/hooks/common/useCurrency";
import { cn, formatAmount } from "@/utils";
import { ArrowDown, ArrowRightIcon, ArrowUp, ArrowUpRight, TrendingUp, Users } from "lucide-react";
import { formatUnits } from "viem";
import { useCountdown, useSwapPriceHistory, useMarketStats } from "../../hooks";
import { PredictionMarket } from "../../types";
import { LivePriceChart } from "../LivePriceChart";
import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useReadBinaryLmsrMarketManagerPriceNo, useReadBinaryLmsrMarketManagerPriceYes } from "@/generated";
import { useNow } from "@/hooks/common/useNow";

interface FeaturedMarketCardProps {
    market: PredictionMarket;
    onSelectMarket: (market: PredictionMarket) => void;
    refetchMarket: () => void;
}

export function FeaturedMarketCard({ market, onSelectMarket, refetchMarket }: FeaturedMarketCardProps) {
    const marketCurrency = useCurrency(market.marketToken);
    const quoteCurrency = useCurrency(market.quoteToken);

    const targetPrice = useMemo(() => {
        if (!quoteCurrency) return 0;
        return Number(formatUnits(BigInt(market.mark), quoteCurrency.decimals));
    }, [market.mark, quoteCurrency]);

    // Live price from swaps
    const { priceHistory, currentPrice } = useSwapPriceHistory(market.pool, marketCurrency, quoteCurrency);

    const priceDeltaPercent = useMemo(() => {
        if (!currentPrice || !targetPrice) return null;
        return ((currentPrice - targetPrice) / targetPrice) * 100;
    }, [currentPrice, targetPrice]);

    const isAboveTarget = priceDeltaPercent !== null && priceDeltaPercent >= 0;

    // Countdown
    const countdown = useCountdown(Number(market.tradingDeadline));

    // Market stats
    const { volume, users } = useMarketStats(market);

    const now = useNow();
    const isMarketClosed = Number(market.plannedResolutionTimestamp) * 1000 <= now;
    const outcome = market.outcome; // 0 = unresolved, 1 = YES won, 2 = NO won
    const outcomeResolved = outcome === 1 || outcome === 2;
    const outcomeText = outcome === 1 ? "YES" : outcome === 2 ? "NO" : null;

    // Calculate market duration for title
    const marketDuration = useMemo(() => {
        const duration = Number(market.plannedResolutionTimestamp) - Number(market.createdAt);
        const minutes = Math.round(duration / 60);
        if (minutes <= 5) return "5 Minutes";
        if (minutes <= 15) return "15 Minutes";
        if (minutes <= 30) return "30 Minutes";
        if (minutes <= 60) return "1 Hour";
        return `${Math.round(minutes / 60)} Hours`;
    }, [market.plannedResolutionTimestamp, market.createdAt]);

    // Calculate date range
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

    const { data: priceYes } = useReadBinaryLmsrMarketManagerPriceYes({
        args: [market.index],
    });
    const { data: priceNo } = useReadBinaryLmsrMarketManagerPriceNo({
        args: [market.index],
    });

    const yesPercent = priceYes ? Number(formatUnits(priceYes, 18)) * 100 : 50;
    const noPercent = priceNo ? Number(formatUnits(priceNo, 18)) * 100 : 50;

    const displaySymbol = marketCurrency?.symbol === "WETH" ? "Ethereum" : marketCurrency?.symbol;

    useEffect(() => {
        if (countdown.isExpired) {
            refetchMarket();
        }
    }, [refetchMarket, countdown.isExpired]);

    return (
        <div className="relative overflow-hidden rounded-2xl bg-card border border-card-border">
            <div className="relative flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <CurrencyLogo currency={marketCurrency} size={48} />

                    <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-white">
                                {displaySymbol} Up or Down - {marketDuration}
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
                <button onClick={() => onSelectMarket(market)} className="flex items-center gap-2 text-sm text-text-300">
                    View Details <ArrowRightIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="relative grid grid-cols-3 px-5 py-4 bg-card border-b border-t border-card-border">
                <div className="flex flex-col items-start">
                    <div className="text-[11px] text-text-300 uppercase tracking-wider mb-1">Price To Beat</div>
                    <div className="text-2xl font-bold text-white tabular-nums">
                        {formatAmount(targetPrice, 6)}
                        <span className="text-xs font-normal"> {quoteCurrency?.symbol}</span>
                    </div>
                </div>

                <div className="flex flex-col items-start border-l border-card-border pl-4">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider mb-1">
                        <span className={cn(isAboveTarget ? "text-green-400" : "text-red-400")}>Current Price</span>
                        {priceDeltaPercent !== null && (
                            <span className={cn("font-bold", isAboveTarget ? "text-green-400" : "text-red-400")}>
                                {isAboveTarget ? "▲" : "▼"} {formatAmount(Math.abs(priceDeltaPercent), 2)}%
                            </span>
                        )}
                    </div>
                    <div className={cn("text-2xl font-bold tabular-nums", isAboveTarget ? "text-green-400" : "text-red-400")}>
                        {currentPrice ? `${formatAmount(currentPrice, 6)}` : "—"}
                        <span className="text-xs font-normal"> {quoteCurrency?.symbol}</span>
                    </div>
                </div>

                <div className="flex flex-col items-start border-l border-card-border pl-4">
                    <div className="text-[11px] text-text-300 uppercase tracking-wider mb-1">Time Left</div>
                    <div className="flex items-baseline gap-1">
                        <span
                            className={cn(
                                "text-3xl font-bold tabular-nums",
                                countdown.isExpired ? "text-text-300" : countdown.totalSeconds < 60 ? "text-red-500" : "text-white",
                            )}
                        >
                            {countdown.minutes.toString().padStart(2, "0")}
                        </span>
                        <span className="text-lg text-text-300">:</span>
                        <span
                            className={cn(
                                "text-3xl font-bold tabular-nums",
                                countdown.isExpired ? "text-text-300" : countdown.totalSeconds < 60 ? "text-red-500" : "text-white",
                            )}
                        >
                            {countdown.seconds.toString().padStart(2, "0")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between ">
                <LivePriceChart priceHistory={priceHistory} targetPrice={targetPrice} currentPrice={currentPrice} height={240} />
                <div className="flex flex-col gap-2 z-20 min-w-fit h-[240px] p-2">
                    <Link
                        className="h-full"
                        to={{
                            pathname: `/prediction`,
                            search: "?buy=yes",
                        }}
                    >
                        <button
                            className={cn(
                                "group flex flex-col items-center justify-center w-20 h-full rounded-2xl transition-all duration-200",
                                "bg-green-600",
                                "hover:bg-green-600  hover:scale-105",
                                "active:scale-95",
                            )}
                        >
                            <ArrowUp size={28} className="group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold mt-1">Up</span>
                            <span className="text-xs ">{yesPercent.toFixed(0)}%</span>
                        </button>
                    </Link>
                    <Link
                        className="h-full"
                        to={{
                            pathname: `/prediction`,
                            search: "?buy=no",
                        }}
                    >
                        <button
                            className={cn(
                                "group flex flex-col items-center justify-center w-20 h-full rounded-2xl transition-all duration-200",
                                "bg-red-600",
                                "hover:bg-red-600  hover:scale-105",
                                "active:scale-95",
                            )}
                        >
                            <ArrowDown size={28} className="group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold mt-1">Down</span>
                            <span className="text-xs ">{noPercent.toFixed(0)}%</span>
                        </button>
                    </Link>
                </div>
            </div>

            <div className="relative flex items-center justify-between px-5 py-3 border-t border-card-border ">
                <div className="flex items-center gap-4 text-xs text-text-300">
                    <span className="flex items-center gap-1.5">
                        <TrendingUp size={14} />
                        <span className="font-medium text-white">{volume}</span> volume
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Users size={14} />
                        <span className="font-medium text-white">{users}</span> traders
                    </span>
                </div>

                <Link to={`/pool/${market.pool}`} className="flex items-center gap-1 text-xs text-text-300 hover:text-text-200">
                    Pool: {market.pool.slice(0, 6)}...{market.pool.slice(-4)}
                    <ArrowUpRight size={12} />
                </Link>
            </div>
        </div>
    );
}
