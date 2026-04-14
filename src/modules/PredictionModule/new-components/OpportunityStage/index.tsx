import { useMemo, useCallback } from "react";
import { PredictionMarket } from "../../types";
import { FeaturedMarketCard } from "../FeaturedMarketCard";
import { MarketLadder } from "../MarketLadder";
import { UserMarkets } from "../UserMarkets";
import { useNavigate } from "react-router-dom";

interface OpportunityStageProps {
    markets: PredictionMarket[];
    featuredMarket?: PredictionMarket;
    isLoading?: boolean;
    hideUserMarkets?: boolean;
    refetchMarkets: () => void;
}

export function OpportunityStage({ markets, featuredMarket, isLoading, hideUserMarkets, refetchMarkets }: OpportunityStageProps) {
    const navigate = useNavigate();

    const secondaryMarkets = useMemo(() => {
        return markets.filter((m) => m.id !== featuredMarket?.id);
    }, [markets, featuredMarket]);

    const handleSelectMarket = useCallback(
        (market: PredictionMarket) => {
            navigate(`/prediction/${market.id}`);
        },
        [navigate],
    );

    const handleSelectSideFromLadder = useCallback(
        (market: PredictionMarket, side: "yes" | "no") => {
            navigate(`/prediction/${market.id}?buy=${side}`);
        },
        [navigate],
    );

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-10 rounded-xl bg-card-light/50 w-2/3" />
                <div className="h-64 rounded-2xl bg-card-light/50" />
                <div className="h-20 rounded-xl bg-card-light/50" />
                <div className="h-20 rounded-xl bg-card-light/50" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {featuredMarket && (
                <FeaturedMarketCard market={featuredMarket} onSelectMarket={handleSelectMarket} refetchMarket={refetchMarkets} />
            )}
            {secondaryMarkets.length > 0 && (
                <MarketLadder markets={secondaryMarkets} onSelectMarket={handleSelectMarket} onSelectSide={handleSelectSideFromLadder} />
            )}
            {!hideUserMarkets && <UserMarkets onSelectMarket={handleSelectMarket} />}
        </div>
    );
}
