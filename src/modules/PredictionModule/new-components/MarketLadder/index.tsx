import { useCurrency } from "@/hooks/common/useCurrency";
import { cn } from "@/utils";
import { formatDateDDMM } from "@/utils/common/formatDate";
import { formatUnits } from "viem";
import { PredictionMarket } from "../../types";
import { useReadBinaryLmsrMarketManagerPriceNo, useReadBinaryLmsrMarketManagerPriceYes } from "@/generated";
import CurrencyLogo from "@/components/common/CurrencyLogo";

interface MarketLadderProps {
    markets: PredictionMarket[];
    onSelectMarket: (market: PredictionMarket) => void;
    onSelectSide?: (market: PredictionMarket, side: "yes" | "no") => void;
}

export function MarketLadder({ markets, onSelectMarket, onSelectSide }: MarketLadderProps) {
    const marketToken = useCurrency(markets[0].marketToken);
    if (!markets.length) return null;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-semibold text-text-300 uppercase tracking-wider">More {marketToken?.symbol} Markets</span>
                <span className="text-xs text-text-300">{markets.length} total</span>
            </div>
            {markets.map((market) => (
                <MarketLadderCard
                    key={market.id}
                    market={market}
                    onSelect={() => onSelectMarket(market)}
                    onYes={() => {
                        onSelectSide?.(market, "yes");
                    }}
                    onNo={() => {
                        onSelectSide?.(market, "no");
                    }}
                />
            ))}
        </div>
    );
}

function MarketLadderCard({
    market,
    onSelect,
    onYes,
    onNo,
}: {
    market: PredictionMarket;
    onSelect: () => void;
    onYes: () => void;
    onNo: () => void;
}) {
    const isGreater = market.condition === "greater";

    const marketCurrency = useCurrency(market.marketToken);
    const quoteCurrency = useCurrency(market.quoteToken);

    const formattedMark = quoteCurrency
        ? ((val) => (val < 1 ? val.toPrecision(4) : val.toLocaleString()))(Number(formatUnits(BigInt(market.mark), quoteCurrency.decimals)))
        : "0";

    const { data: priceYes } = useReadBinaryLmsrMarketManagerPriceYes({ args: [market.index] });
    const { data: priceNo } = useReadBinaryLmsrMarketManagerPriceNo({ args: [market.index] });

    const yesPercent = priceYes ? (Number(formatUnits(priceYes, 18)) * 100).toFixed(0) : "—";
    const noPercent = priceNo ? (Number(formatUnits(priceNo, 18)) * 100).toFixed(0) : "—";

    return (
        <div
            className={cn(
                "group rounded-xl transition-all flex items-center duration-150 border overflow-hidden p-4 cursor-pointer",
                "bg-card-dark border-card-border hover:border-card-border/80",
            )}
            onClick={onSelect}
        >
            <div className="flex items-center justify-between gap-2">
                <CurrencyLogo currency={marketCurrency} size={36} className="mr-2" />

                <span className="text-sm font-semibold text-white leading-snug">
                    Will {marketCurrency?.symbol}{" "}
                    <span className={cn(isGreater ? "text-green-400" : "text-red-400")}>be {isGreater ? "greater" : "lower"} than</span>{" "}
                    {formattedMark} {quoteCurrency?.symbol}?
                </span>

                <span className="text-xs text-text-300 shrink-0">{formatDateDDMM(market.tradingDeadline)}</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onYes();
                    }}
                    className="px-3 py-2 rounded-full text-xs font-semibold bg-green-500/20 hover:bg-green-500/40 transition-all"
                >
                    Yes {yesPercent}%
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNo();
                    }}
                    className="px-3 py-2 rounded-full text-xs font-semibold bg-red-500/20 hover:bg-red-500/40 transition-all"
                >
                    No {noPercent}%
                </button>
            </div>
        </div>
    );
}
