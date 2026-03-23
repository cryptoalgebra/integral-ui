import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useReadPredictionMarketPriceNo, useReadPredictionMarketPriceYes } from "@/generated";
import { useMarketStats } from "@/hooks/prediction/useMarketStats";
import { PredictionMarket } from "@/types/prediction";
import { cn } from "@/utils";
import { Pool } from "@cryptoalgebra/integral-sdk";
import { ArrowUp, ArrowDown, Clock, Users2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatUnits } from "viem";

interface IPredictionMarketCard {
    market: PredictionMarket;
    pool: Pool | undefined | null;
}

const PredictionMarketCard = ({ market, pool }: IPredictionMarketCard) => {
    const isGreater = market.condition === "greater";

    const marketCurrency = market.marketToken === 0 ? pool?.token0 : pool?.token1;
    const quoteCurrency = market.marketToken === 0 ? pool?.token1 : pool?.token0;

    const formattedCondition = quoteCurrency
        ? formatUnits(BigInt(market.mark), quoteCurrency.decimals).split(".")[0]
        : 0;


    const { data: priceYes } = useReadPredictionMarketPriceYes({
        address: market?.id,
    })

    const { data: priceNo } = useReadPredictionMarketPriceNo({
        address: market?.id
    })

    const formattedYesPrice = priceYes ? (Number(formatUnits(priceYes, 18)) * 100).toFixed(2) : 0
    const formattedNoPrice = priceNo ? (Number(formatUnits(priceNo, 18)) * 100).toFixed(2) : 0

    const { tvl, volume, users, tradingDeadline } = useMarketStats(market)

    const isOpen = Number(market.plannedResolutionTimestamp) * 1000 > Date.now();

    return (
        <Link to={`/prediction/${market.id}`}
            className={cn(
                "block w-full rounded-2xl border p-5 transition-all duration-200 text-left",
                "bg-card-dark shadow-sm",
                "border-card-border hover:bg-card-hover"
            )}
        >
            <div className="flex items-center gap-3 mb-4">

                <div className="w-9 h-9 relative">
                    <CurrencyLogo currency={marketCurrency} size={36} />
                    <div className={cn("flex items-center justify-center absolute w-5 h-5 border rounded-full -right-2 -bottom-1", isGreater ? "bg-green-800 border-green-400" : "bg-red-800 border-red-400")}>
                        {isGreater ? (
                            <ArrowUp className="text-green-400" size={12} />
                        ) : (
                            <ArrowDown className="text-red-300" size={12} />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-text-200">
                    <span className="uppercase">{marketCurrency?.symbol}</span>
                </div>

                { isOpen ? <div className="inline-flex items-center gap-2 ml-auto rounded-full text-white text-xs font-medium">

                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
                    </span>

                    <span className="uppercase tracking-wide text-green-400">
                        Live
                    </span>
                </div> : market.userWon ? <div className="ml-auto text-xs text-green-400">Win</div> : <div className="ml-auto text-xs text-red-400">Lose</div> }

            </div>

            <div>
                Will {marketCurrency?.symbol === "WETH" ? "ETH" : marketCurrency?.symbol} be{" "}
                <span
                    className={cn(
                        isGreater ? "text-green-400" : "text-red-400"
                    )}
                >
                    {market.condition}
                </span>{" "}
                than {formattedCondition} {quoteCurrency?.symbol}?
            </div>

            { isOpen ? <div className="flex gap-3 my-4 font-semibold">

                <Link
                    to={{
                        pathname: `/prediction/${market.id}`,
                        search: '?buy=yes'
                    }}
                    className={cn(
                        "w-full py-3 bg-white/5 border border-card-border rounded-lg text-center transition",
                        "bg-white/5 hover:bg-lime-600"
                    )}
                >
                    <span className="text-white/70 mr-2">Yes</span>
                    {priceYes !== undefined && <span>{formattedYesPrice}¢</span>}
                </Link>
                <Link
                    to={{
                        pathname: `/prediction/${market.id}`,
                        search: '?buy=no'
                    }}
                    className={cn(
                        "w-full py-3 bg-white/5 border border-card-border rounded-lg text-center transition",
                        "bg-white/5 hover:bg-orange-600"
                    )}
                >
                    <span className="text-white/70 mr-2">No</span>
                    {priceNo !== undefined && <span>{formattedNoPrice}¢</span>}
                </Link>

            </div> : <div className="my-4" /> }

            <div className="flex items-center text-xs text-text-200">
                    <div className="flex gap-1">
                        <Clock size={16} />
                        <div>{tradingDeadline}</div>
                    </div>
                    <div className="ml-auto flex gap-1">
                        <div>{tvl}</div>
                        <div>TVL</div>
                    </div>
                    <div className="mx-1">•</div>
                    <div className="flex gap-1">
                        <div>${volume}</div>
                        <div>volume</div>
                    </div>
                    <div className="mx-1">•</div>
                    <div className="flex gap-1">
                        <Users2 size={16} />
                        <div>{users}</div>
                    </div>
            </div>
        </Link>
    );
};

export default PredictionMarketCard;