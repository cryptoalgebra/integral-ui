import PageContainer from "@/components/common/PageContainer";
import PoweredByAlgebra from "@/components/common/PoweredByAlgebra";
import { useDerivedSwapInfo } from "@/state/swapStore.ts";
import { SwapPageProps, SwapPageView } from "./types";
import SwapChart from "@/components/swap/SwapChart";
import { Address } from "viem";
import { useMemo } from "react";
import { SwapForm } from "@/components/swap/SwapForm";
import PageTitle from "@/components/common/PageTitle";

import LimitOrdersModule from "@/modules/LimitOrdersModule";
const { LimitOrderForm, LimitOrdersList } = LimitOrdersModule.components;

import PredictionModule from "@/modules/PredictionModule";
const { PredictionForm, OpportunityStage } = PredictionModule.components;
const { useMarketsByTokens } = PredictionModule.hooks;

const SwapPage = ({ type }: SwapPageProps) => {
    const derivedSwap = useDerivedSwapInfo();

    const { data: marketsForTokens, loading: isLoadingMarkets, refetch: refetchMarkets } = useMarketsByTokens(
        derivedSwap.currencies.INPUT?.wrapped.address as Address,
        derivedSwap.currencies.OUTPUT?.wrapped.address as Address,
    );

    const isPredictionPool = Boolean(marketsForTokens?.length);

    const featuredMarket = useMemo(() => {
        return marketsForTokens.find((m) => Number(m.plannedResolutionTimestamp) - Number(m.createdAt) <= 3600);
    }, [marketsForTokens]);

    return (
        <PageContainer>
            <div className="mb-8">
                <PageTitle title={"Trade"} showSettings={false} />
            </div>

            <div className="grid md:grid-cols-5 grid-cols-1 w-full md:gap-3 gap-y-3 mb-3 relative">
                <div className="flex flex-col gap-3 col-span-2 w-full h-fit lg:sticky top-58">
                    {type === SwapPageView.SWAP && <SwapForm derivedSwap={derivedSwap} />}
                    {type === SwapPageView.LIMIT_ORDER && <LimitOrderForm derivedSwap={derivedSwap} />}
                    {type === SwapPageView.PREDICTION && <PredictionForm market={featuredMarket} refetchMarket={refetchMarkets} />}
                    <PoweredByAlgebra />
                </div>

                <div className="flex flex-col col-span-3 overflow-y-auto">
                    {isLoadingMarkets ? null : isPredictionPool ? (
                        <OpportunityStage
                            markets={marketsForTokens}
                            featuredMarket={featuredMarket}
                            isLoading={isLoadingMarkets}
                            hideUserMarkets={type !== SwapPageView.PREDICTION}
                            refetchMarkets={refetchMarkets}
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
