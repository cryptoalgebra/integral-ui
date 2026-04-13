import PageContainer from "@/components/common/PageContainer";
import PoweredByAlgebra from "@/components/common/PoweredByAlgebra";
import { useDerivedSwapInfo } from "@/state/swapStore.ts";
import { SwapPageProps, SwapPageView } from "./types";
import SwapChart from "@/components/swap/SwapChart";
import { Address } from "viem";
import { useNow } from "@/hooks/common/useNow";
import { useState, useCallback, useMemo } from "react";
import { SwapForm } from "@/components/swap/SwapForm";
import PageTitle from "@/components/common/PageTitle";

import LimitOrdersModule from "@/modules/LimitOrdersModule";
const { LimitOrderForm, LimitOrdersList } = LimitOrdersModule.components;

import PredictionModule from "@/modules/PredictionModule";
import { PredictionMarket } from "@/modules/PredictionModule/types";
const { PredictionForm, OpportunityStage } = PredictionModule.components;
const { useMarketsByTokens } = PredictionModule.hooks;

const SwapPage = ({ type }: SwapPageProps) => {
    const derivedSwap = useDerivedSwapInfo();

    const { data: marketsForTokens, loading: isLoadingMarkets } = useMarketsByTokens(
        derivedSwap.currencies.INPUT?.wrapped.address as Address,
        derivedSwap.currencies.OUTPUT?.wrapped.address as Address,
    );

    const isPredictionPool = Boolean(marketsForTokens?.length);

    const now = useNow();

    const [selectedMarketId, setSelectedMarketId] = useState<string | undefined>();
    const [selectedSide, setSelectedSide] = useState<"yes" | "no" | undefined>();

    const featuredMarket = useMemo(() => {
        if (!marketsForTokens?.length) return undefined;
        if (selectedMarketId) {
            return marketsForTokens.find((m) => m.id === selectedMarketId) || marketsForTokens[0];
        }
        return marketsForTokens[0];
    }, [marketsForTokens, selectedMarketId]);

    const handleSelectMarket = useCallback((market: PredictionMarket) => {
        setSelectedMarketId(market.id);
    }, []);

    const handleSelectSide = useCallback((side: "yes" | "no") => {
        setSelectedSide(side);
    }, []);

    return (
        <PageContainer>
            <div className="mb-8">
                <PageTitle title={"Trade"} showSettings={false} />
            </div>

            <div className="grid md:grid-cols-5 grid-cols-1 w-full md:gap-3 gap-y-3 mb-3 relative">
                <div className="flex flex-col gap-3 col-span-2 w-full h-fit">
                    {type === SwapPageView.SWAP && <SwapForm derivedSwap={derivedSwap} />}
                    {type === SwapPageView.LIMIT_ORDER && <LimitOrderForm derivedSwap={derivedSwap} />}
                    {type === SwapPageView.PREDICTION && <PredictionForm market={featuredMarket} initialSide={selectedSide} />}
                    <PoweredByAlgebra />
                </div>

                <div className="flex flex-col col-span-3 overflow-y-auto">
                    {isLoadingMarkets ? null : isPredictionPool ? (
                        <OpportunityStage
                            markets={marketsForTokens}
                            inputCurrency={derivedSwap.currencies.INPUT}
                            now={now}
                            isLoading={isLoadingMarkets}
                            selectedMarketId={selectedMarketId || featuredMarket?.id}
                            onSelectMarket={handleSelectMarket}
                            onSelectSide={handleSelectSide}
                        />
                    ) : (
                        <SwapChart derivedSwap={derivedSwap} />
                    )}
                </div>
            </div>

            {type === SwapPageView.LIMIT_ORDER && <LimitOrdersList />}
        </PageContainer>
    );
};

export default SwapPage;
