import { useCurrency } from "@/hooks/common/useCurrency";
import { cn, formatAmount } from "@/utils";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";
import { useUserMarkets, UserClosedMarket, usePredictionRedeem } from "../../hooks";
import { Button } from "@/components/ui/button";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { formatDateDDMM } from "@/utils/common/formatDate";
import { useState } from "react";

interface UserClosedMarketsProps {
    onSelectMarket?: (market: UserClosedMarket) => void;
}

export function UserClosedMarkets({ onSelectMarket }: UserClosedMarketsProps) {
    const { address: account } = useAccount();
    const { data, loading, refetch } = useUserMarkets(account);

    if (!account) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-text-300" />
            </div>
        );
    }

    if (!data.closedMarkets.length) return null;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-xs font-semibold text-text-300 uppercase tracking-wider">Your Markets</span>
                <span className="text-xs text-text-300">{data.closedMarkets.length} closed</span>
            </div>

            {data.closedMarkets.map((market) => (
                <ClosedMarketCard key={market.id} market={market} onSelect={onSelectMarket} onRedeem={refetch} />
            ))}
        </div>
    );
}

function ClosedMarketCard({
    market,
    onSelect,
    onRedeem,
}: {
    market: UserClosedMarket;
    onSelect?: (market: UserClosedMarket) => void;
    onRedeem?: () => void;
}) {
    const [isRedeeming, setIsRedeeming] = useState(false);
    const marketCurrency = useCurrency(market.marketToken);
    const quoteCurrency = useCurrency(market.quoteToken);

    const collateralCurrency = useCurrency(market.collateralToken);

    const { redeem, isLoading: isRedeemLoading } = usePredictionRedeem(market, () => {
        setIsRedeeming(false);
        onRedeem?.();
    });

    const isGreater = market.condition === "greater";
    const userWon = market.userWon;
    const userRedeemed = market.userRedeemed;

    // Format values
    const formattedMark = quoteCurrency
        ? ((val) => (val < 1 ? val.toPrecision(4) : val.toLocaleString()))(Number(formatUnits(BigInt(market.mark), quoteCurrency.decimals)))
        : "0";

    // Calculate position value
    const yesAmount = Number(formatUnits(BigInt(market.yesShares || "0"), 6));
    const noAmount = Number(formatUnits(BigInt(market.noShares || "0"), 6));

    // Winning amount (what user gets if they won)
    const winningPosition = market.outcome === 1 ? yesAmount : noAmount;

    const canClaim = userWon && !userRedeemed;

    const handleClaim = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRedeeming(true);
        redeem();
    };

    return (
        <div
            className={cn(
                "group rounded-xl transition-all flex justify-between items-center duration-150 border overflow-hidden p-4",
                "bg-card-dark border-card-border ",
                "cursor-pointer duration-200",
                // canClaim && "border-green-500/30 bg-green-500/5",
            )}
            onClick={() => onSelect?.(market)}
        >
            <div className="flex items-center justify-between gap-2">
                <CurrencyLogo currency={marketCurrency} size={36} className="mr-2" />
                <span className="text-sm font-semibold text-white leading-snug">
                    Will {marketCurrency?.symbol}{" "}
                    <span className={cn(isGreater ? "text-green-400" : "text-red-400")}>be {isGreater ? "greater" : "lower"} than</span>{" "}
                    {formattedMark} {quoteCurrency?.symbol}?
                </span>

                <span className="text-xs text-text-300 shrink-0">{formatDateDDMM(market.tradingDeadline)}</span>
                {/* Win/Lose Badge */}
                <span
                    className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                        userWon ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400",
                    )}
                >
                    {userWon ? "Won" : "Lost"}
                </span>
            </div>

            {/* Right: PnL + Action */}
            <div className="flex items-center gap-4">
                {/* Action Button */}
                {canClaim ? (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleClaim}
                        disabled={isRedeeming || isRedeemLoading}
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-green-500 hover:bg-green-600"
                    >
                        {isRedeeming || isRedeemLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Claim {formatAmount(winningPosition, 6)} {collateralCurrency?.symbol}
                            </>
                        )}
                    </Button>
                ) : userRedeemed ? (
                    <div className="px-3 py-2 rounded-lg bg-card-border/30 text-xs text-text-300">Claimed</div>
                ) : null}
            </div>
        </div>
    );
}
