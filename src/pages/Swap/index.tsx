import PageContainer from "@/components/common/PageContainer";
import PoweredByAlgebra from "@/components/common/PoweredByAlgebra";
import { useDerivedSwapInfo } from "@/state/swapStore.ts";
import { SwapPageProps, SwapPageView } from "./types";
import { Address } from "viem";
import { useMemo } from "react";
import { SwapForm } from "@/components/swap/SwapForm";
import PageTitle from "@/components/common/PageTitle";

import LimitOrdersModule from "@/modules/LimitOrdersModule";
const { LimitOrderForm, LimitOrdersList } = LimitOrdersModule.components;

import PredictionModule from "@/modules/PredictionModule";
import { cn } from "@/utils";
const { PredictionForm, OpportunityStage } = PredictionModule.components;
const { useMarketsByTokens } = PredictionModule.hooks;

const SwapPage = ({ type }: SwapPageProps) => {
    const derivedSwap = useDerivedSwapInfo();

    const [token0, token1] = useMemo(() => {
        const tokenA = derivedSwap.currencies.INPUT?.wrapped;
        const tokenB = derivedSwap.currencies.OUTPUT?.wrapped;

        if (!tokenA || !tokenB) return [undefined, undefined];

        const isSorted = tokenA?.sortsBefore(tokenB!);

        return isSorted ? [tokenA, tokenB] : [tokenB, tokenA];
    }, [derivedSwap.currencies.INPUT, derivedSwap.currencies.OUTPUT]);

    const { data: marketsForTokens, loading: isLoadingMarkets, refetch: refetchMarkets } = useMarketsByTokens(
        token0?.address as Address,
        token1?.address as Address,
    );

    const isPredictionPool = type === SwapPageView.PREDICTION && Boolean(marketsForTokens?.length);

    const featuredMarket = useMemo(() => {
        if (!marketsForTokens?.length) return;
        return marketsForTokens.find((m) => Number(m.plannedResolutionTimestamp) - Number(m.createdAt) <= 3600);
    }, [marketsForTokens]);

    const hasRightColumn = type === SwapPageView.LIMIT_ORDER || (!isLoadingMarkets && isPredictionPool);

    return (
        <PageContainer className="w-full items-center">
            <div className={`w-full transition-all duration-200 ease-in-out ${hasRightColumn ? "lg:w-full" : "lg:w-2/5 xl:w-[580px]"}`}>
                <div className="mb-6">
                    <PageTitle title={"Trade"} showSettings={false} />
                </div>

                <div
                    className={cn(
                        "mb-3 grid w-full grid-cols-1 items-start gap-3 transition-all duration-200 ease-out lg:grid-cols-4 xl:grid-cols-5",
                    )}
                >
                    <div
                        className={cn(
                            "flex z-10 h-fit w-full flex-col gap-3 lg:sticky top-58 lg:col-span-2  max-w-[580px]",
                            hasRightColumn ? "lg:col-span-2 lg:min-w-[492px]" : "lg:col-span-5",
                        )}
                    >
                        {type === SwapPageView.SWAP && <SwapForm derivedSwap={derivedSwap} />}
                        {type === SwapPageView.LIMIT_ORDER && <LimitOrderForm derivedSwap={derivedSwap} />}
                        {type === SwapPageView.PREDICTION && <PredictionForm market={featuredMarket} refetchMarket={refetchMarkets} />}

                        <PoweredByAlgebra />
                    </div>

                    {hasRightColumn && (
                        <div className="flex min-w-0 flex-col gap-3 overflow-y-auto md:col-span-2 xl:col-span-3">
                            {isLoadingMarkets
                                ? null
                                : isPredictionPool && (
                                      <OpportunityStage
                                          markets={marketsForTokens}
                                          featuredMarket={featuredMarket}
                                          isLoading={isLoadingMarkets}
                                          hideUserMarkets={type !== SwapPageView.PREDICTION}
                                          refetchMarkets={refetchMarkets}
                                      />
                                  )}
                            {type === SwapPageView.LIMIT_ORDER && <LimitOrdersList />}
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default SwapPage;
