import PageContainer from "@/components/common/PageContainer";
import PoweredByAlgebra from "@/components/common/PoweredByAlgebra";
import { useDerivedSwapInfo } from "@/state/swapStore.ts";
import SwapChart from "@/components/swap/SwapChart";
import { Address } from "viem";
import { SwapForm } from "@/components/swap/SwapForm";
import PageTitle from "@/components/common/PageTitle";
import { SwapPageProps, SwapPageView } from "../Swap/types";
import { useNavigate, useParams } from "react-router-dom";

import LimitOrdersModule from "@/modules/LimitOrdersModule";
const { LimitOrderForm, LimitOrdersList } = LimitOrdersModule.components;

import PredictionModule from "@/modules/PredictionModule";
const { PredictionForm, PredictionMarketDetails } = PredictionModule.components;
const { useSingleMarket } = PredictionModule.hooks;

const PredictionMarketPage = ({ type }: SwapPageProps) => {
    const navigate = useNavigate();
    const derivedSwap = useDerivedSwapInfo();

    const { market: marketAddress } = useParams() as { market: Address };
    const { data: market, refetch: refetchMarket } = useSingleMarket(marketAddress);

    return (
        <PageContainer>
            <div className="mb-8">
                <PageTitle title={"Trade"} showSettings={false} />
            </div>

            <div className="grid md:grid-cols-5 grid-cols-1 w-full md:gap-3 gap-y-3 mb-3 relative">
                <div className="flex flex-col gap-3 col-span-2 w-full h-fit lg:sticky top-58">
                    {type === SwapPageView.SWAP && <SwapForm derivedSwap={derivedSwap} />}
                    {type === SwapPageView.LIMIT_ORDER && <LimitOrderForm derivedSwap={derivedSwap} />}
                    {type === SwapPageView.PREDICTION && (
                        <PredictionForm market={market} initialSide={"yes"} refetchMarket={refetchMarket} />
                    )}
                    <PoweredByAlgebra />
                </div>

                <div className="flex flex-col col-span-3 overflow-y-auto">
                    {market ? (
                        <PredictionMarketDetails market={market} onBack={() => navigate("/swap")} />
                    ) : (
                        <SwapChart derivedSwap={derivedSwap} />
                    )}
                </div>
            </div>

            {type === SwapPageView.LIMIT_ORDER && <LimitOrdersList />}
        </PageContainer>
    );
};

export default PredictionMarketPage;
