import SwapPair from "@/components/swap/SwapPair";
import SwapButton from "@/components/swap/SwapButton";
import SwapParams from "@/components/swap/SwapParams";
import PageContainer from "@/components/common/PageContainer";
import PoweredByAlgebra from "@/components/common/PoweredByAlgebra";
import { useDerivedSwapInfo } from "@/state/swapStore.ts";
import { SwapPageProps, SwapPageView } from "./types";
import SwapChart from "@/components/swap/SwapChart";

import LimitOrdersModule from "@/modules/LimitOrdersModule";
import PredictionPoolSelector from "@/components/prediction/PredictionPoolSelector";
import PredictionMarkets from "@/components/prediction/PredictionMarkets";
import PredictionInfo from "@/components/prediction/PredictionInfo";
const { LimitOrder, SwapTypeSelector, LimitOrdersList } = LimitOrdersModule.components;

const SwapPage = ({ type }: SwapPageProps) => {

    const isSwap = type === SwapPageView.SWAP;
    const isLimitOrder = type === SwapPageView.LIMIT_ORDER;
    const isPrediction = type === SwapPageView.PREDICTION;

    const derivedSwap = useDerivedSwapInfo();

    return (
        <PageContainer>
            <div className="grid grid-flow-col max-md:flex max-md:flex-col-reverse auto-cols-fr w-fit gap-3 mb-8">
                <SwapTypeSelector 
                    isSwap={isSwap}
                    isLimitOrder={isLimitOrder}
                    isPrediction={isPrediction}
                />
            </div>
            <div className="grid md:grid-cols-3 grid-cols-1 w-full md:gap-3 gap-y-3 mb-3">
                <div className="flex flex-col gap-2 col-span-1 w-full">
                    {isPrediction && (<div>
                        <PredictionPoolSelector />
                        <PredictionMarkets/>
                    </div>)}
                    {(isSwap || isLimitOrder) && <div className="flex flex-col gap-1.5 col-span-1 w-full bg-dark-gradient border border-card-border p-2 rounded-xl">
                        {(isSwap || isLimitOrder) && <SwapPair derivedSwap={derivedSwap} />}
                        
                        {isSwap && <SwapParams derivedSwap={derivedSwap} />}
                        {isSwap && <SwapButton derivedSwap={derivedSwap} />}

                        {isLimitOrder && <LimitOrder derivedSwap={derivedSwap} />}
                    </div>}
                    <PoweredByAlgebra />
                </div>
                <div className="flex flex-col col-span-2 md:max-h-[514px]">
                    <SwapChart derivedSwap={derivedSwap} prediction={isPrediction ? {lower: 1595, lowerTimestamp: 1773841272, greater: 2392, greaterTimestamp: 1773841272} : undefined} />
                    {isPrediction && <PredictionInfo />}
                </div>
            </div>
            {isLimitOrder && <LimitOrdersList />}
        </PageContainer>
    );
};

export default SwapPage;
