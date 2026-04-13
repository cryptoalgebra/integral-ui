import { Currency } from "@cryptoalgebra/integral-sdk";
import { useMemo, useCallback, useState, useEffect } from "react";
import { PredictionMarket } from "../../types";
import { FeaturedMarketCard } from "../FeaturedMarketCard";
import { MarketLadder } from "../MarketLadder";
import { MarketDetailView } from "../MarketDetailView";
import { UserClosedMarkets } from "../UserClosedMarkets";
import { useNavigate } from "react-router-dom";

interface OpportunityStageProps {
    markets: PredictionMarket[];
    inputCurrency?: Currency | null;
    now: number;
    isLoading?: boolean;
    selectedMarketId?: string;
    onSelectMarket?: (market: PredictionMarket) => void;
    onSelectSide?: (side: "yes" | "no") => void;
}

export function OpportunityStage({ markets, isLoading, selectedMarketId, onSelectMarket, onSelectSide }: OpportunityStageProps) {
    const navigate = useNavigate();
    const [detailMarket, setDetailMarket] = useState<PredictionMarket | null>(null);

    const featuredMarket = useMemo(() => {
        if (selectedMarketId) {
            return markets.find((m) => Number(m.plannedResolutionTimestamp) - Number(m.createdAt) <= 3600);
        }
        return markets[0];
    }, [markets, selectedMarketId]);

    const secondaryMarkets = useMemo(() => {
        return markets.filter((m) => m.id !== featuredMarket?.id);
    }, [markets, featuredMarket]);

    const handleSelectMarket = useCallback(
        (market: PredictionMarket) => {
            onSelectMarket?.(market);
            setDetailMarket(market);
            navigate("/prediction");
        },
        [onSelectMarket, navigate],
    );

    const handleSelectSideFromLadder = useCallback(
        (market: PredictionMarket, side: "yes" | "no") => {
            onSelectMarket?.(market);
            setDetailMarket(market);
            onSelectSide?.(side);
        },
        [onSelectMarket, onSelectSide],
    );

    const handleBack = useCallback(() => {
        setDetailMarket(null);
        navigate("/swap");
    }, [navigate]);

    useEffect(() => {
        if (detailMarket === null && featuredMarket) {
            onSelectMarket?.(featuredMarket);
        }
    }, [detailMarket, featuredMarket, onSelectMarket]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-10 rounded-xl bg-card-dark/50 w-2/3" />
                <div className="h-64 rounded-2xl bg-card-dark/50" />
                <div className="h-20 rounded-xl bg-card-dark/50" />
                <div className="h-20 rounded-xl bg-card-dark/50" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {detailMarket ? (
                <MarketDetailView market={detailMarket} onBack={handleBack} />
            ) : (
                <>
                    {featuredMarket && <FeaturedMarketCard market={featuredMarket} onSelectMarket={handleSelectMarket} />}
                    {secondaryMarkets.length > 0 && (
                        <MarketLadder
                            markets={secondaryMarkets}
                            onSelectMarket={handleSelectMarket}
                            onSelectSide={handleSelectSideFromLadder}
                        />
                    )}
                    <UserClosedMarkets onSelectMarket={handleSelectMarket} />
                </>
            )}
        </div>
    );
}
