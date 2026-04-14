import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useCurrency } from "@/hooks/common/useCurrency";
import { cn } from "@/utils";
import { formatDateDDMM, formatFutureTime } from "@/utils/common/formatDate";
import { ArrowDown, ArrowUp, Clock, Users2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatUnits } from "viem";
import { useMarketStats } from "../../hooks";
import { PredictionMarket } from "../../types";
import { useReadBinaryLmsrMarketManagerPriceNo, useReadBinaryLmsrMarketManagerPriceYes } from "@/generated";

interface IPredictionMarketCard {
    market: PredictionMarket;
    now: number;
    from?: string;
}

export function PredictionMarketCard({ market, now, from = "prediction" }: IPredictionMarketCard) {
    const isGreater = market.condition === "greater";

    const marketCurrency = useCurrency(market.marketToken);
    // const quoteCurrency = useCurrency(market.marketToken === 0 ? market.token1 : market.token0);

    // const formattedCondition = quoteCurrency
    //     ? ((value) => value < 1 ? value.toFixed(2) : value.toFixed(0))(Number(formatUnits(BigInt(market.mark), quoteCurrency.decimals)))
    //     : 0;

    const { data: priceYes } = useReadBinaryLmsrMarketManagerPriceYes({
        args: market ? [market.index] : undefined,
    });

    const { data: priceNo } = useReadBinaryLmsrMarketManagerPriceNo({
        args: market ? [market.index] : undefined,
    });

    const formattedYesPrice = priceYes ? (Number(formatUnits(priceYes, 18)) * 100).toFixed(2) : 0;
    const formattedNoPrice = priceNo ? (Number(formatUnits(priceNo, 18)) * 100).toFixed(2) : 0;

    const { tvl, volume, users } = useMarketStats(market);

    const isOpen = Number(market.tradingDeadline) * 1000 > now;
    const isResolved = Number(market.plannedResolutionTimestamp) * 1000 < now;

    const timeLeftForTrading = Number(market.plannedResolutionTimestamp) * 1000 - now;
    const timeLeftUntilResolution = Number(market.plannedResolutionTimestamp) * 1000 - now;

    const isOneHourMarket = Number(market.plannedResolutionTimestamp) - Number(market.createdAt) <= 3600;

    return (
        <Link
            to={{
                pathname: `/prediction/${market.id}`,
                search: `from=${from}`,
            }}
            className={cn(
                "relative flex flex-col w-full rounded-2xl p-5 transition-all duration-200 text-left",
                "bg-card-dark shadow-sm border border-card-border hover:bg-card-hover",
            )}
        >
            <div className="flex items-center gap-4 mb-4">
                <div className="w-9 h-9 relative">
                    <CurrencyLogo currency={marketCurrency} size={36} />
                    {!isOneHourMarket && (
                        <div
                            className={cn(
                                "flex items-center justify-center absolute w-5 h-5 border rounded-full -right-2 -bottom-1",
                                isGreater ? "bg-green-800 border-green-400" : "bg-red-800 border-red-400",
                            )}
                        >
                            {isGreater ? (
                                <ArrowUp className="text-green-400" size={12} />
                            ) : (
                                <ArrowDown className="text-red-300" size={12} />
                            )}
                        </div>
                    )}
                </div>

                {isOneHourMarket ? (
                    <div className="flex flex-1 items-center gap-2 text-base">
                        <div className="flex gap-1">
                            <span>{`1 Hour ${marketCurrency?.symbol === "WETH" ? "ETH" : marketCurrency?.symbol}`}</span>
                            <span className="text-green-400">Up</span>
                            <span>or</span>
                            <span className="text-red-400">Down</span>
                        </div>
                    </div>
                ) : (
                    <div>
                        1 Day {marketCurrency?.symbol === "WETH" ? "ETH" : marketCurrency?.symbol}{" "}
                        <span className={cn(isGreater ? "text-green-400" : "text-red-400")}>{isGreater ? "Up" : "Down"}</span> 10%?
                    </div>
                )}

                {isOpen && !isResolved && isOneHourMarket ? (
                    <div className="inline-flex items-center gap-2 ml-auto rounded-full text-white text-xs font-medium">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
                        </span>

                        <span className="uppercase tracking-wide text-green-400">Live</span>
                    </div>
                ) : isResolved ? (
                    market.userWon ? (
                        market.userRedeemed ? (
                            <div className="ml-auto text-xs text-gray-400">Redeemed</div>
                        ) : (
                            <div className="ml-auto text-xs text-green-400">Redeem</div>
                        )
                    ) : (
                        <div className="ml-auto text-xs text-red-400">Lose</div>
                    )
                ) : null}
            </div>

            {isOpen ? (
                <div className="flex gap-3 my-4 font-semibold mt-auto">
                    <Link
                        to={{
                            pathname: `/prediction/${market.id}`,
                            search: "?buy=yes",
                        }}
                        className={cn(
                            "w-full py-3 bg-white/5 border border-card-border rounded-full text-center transition",
                            "bg-white/5 hover:bg-green-600",
                        )}
                    >
                        <span className="text-white/70 mr-2">{isOneHourMarket ? "Up" : "Yes"}</span>
                        {priceYes !== undefined && <span>{formattedYesPrice}¢</span>}
                    </Link>
                    <Link
                        to={{
                            pathname: `/prediction/${market.id}`,
                            search: "?buy=no",
                        }}
                        className={cn(
                            "w-full py-3 bg-white/5 border border-card-border rounded-full text-center transition",
                            "bg-white/5 hover:bg-red-600",
                        )}
                    >
                        <span className="text-white/70 mr-2">{isOneHourMarket ? "Down" : "No"}</span>
                        {priceNo !== undefined && <span>{formattedNoPrice}¢</span>}
                    </Link>
                </div>
            ) : isResolved ? (
                <div className="my-4 flex-1" />
            ) : (
                <div className="flex gap-3 my-4 font-semibold mt-auto">
                    <div
                        className={cn("w-full py-3 bg-white/5 border border-card-border rounded-full text-center transition", "bg-white/5")}
                    >
                        Trading Ended
                    </div>
                </div>
            )}

            <div className="flex items-center text-xs text-text-200">
                <div className="flex gap-1">
                    <Clock size={16} />
                    <div className="mr-2">
                        {isOpen
                            ? formatFutureTime(timeLeftForTrading)
                            : isResolved
                            ? formatDateDDMM(market.plannedResolutionTimestamp)
                            : `Resolves in ${formatFutureTime(timeLeftUntilResolution)}`}
                    </div>
                </div>
                <div className="ml-auto flex gap-1">
                    <div>{tvl}</div>
                    <div>TVL</div>
                </div>
                <div className="mx-1">•</div>
                <div className="flex gap-1">
                    <div>{volume}</div>
                    <div>volume</div>
                </div>
                <div className="mx-1">•</div>
                <div className={`flex gap-1`}>
                    <Users2 size={16} />
                    <div>{users}</div>
                </div>
            </div>
        </Link>
    );
}
