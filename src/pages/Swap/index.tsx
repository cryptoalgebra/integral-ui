import SwapPair from "@/components/swap/SwapPair";
import SwapButton from "@/components/swap/SwapButton";
import SwapParams from "@/components/swap/SwapParams";
import PageContainer from "@/components/common/PageContainer";
import PoweredByAlgebra from "@/components/common/PoweredByAlgebra";
import { useDerivedSwapInfo } from "@/state/swapStore.ts";
import { SwapPageProps, SwapPageView } from "./types";
import SwapChart from "@/components/swap/SwapChart";

import LimitOrdersModule from "@/modules/LimitOrdersModule";
import PredictionMarkets from "@/components/prediction/PredictionMarkets";
import PredictionChart from "@/components/prediction/PredictionChart";

const { LimitOrder, SwapTypeSelector, LimitOrdersList } = LimitOrdersModule.components;

const SwapPage = ({ type }: SwapPageProps) => {

    const isSwap = type === SwapPageView.SWAP;
    const isLimitOrder = type === SwapPageView.LIMIT_ORDER;
    const isPrediction = type === SwapPageView.PREDICTION;

    const derivedSwap = useDerivedSwapInfo();

    const isPredictionPool = derivedSwap.poolAddress?.toLowerCase() === "0x671ddf7e29272c5bf6996f765fabf58351cff137".toLowerCase()

    return (
        <PageContainer>

            <div className="grid grid-flow-col max-md:flex max-md:flex-col-reverse auto-cols-fr w-fit gap-3 mb-8">
                <SwapTypeSelector 
                    isSwap={isSwap}
                    isLimitOrder={isLimitOrder}
                    isPrediction={isPrediction}
                />
            </div>

            {(isSwap || isLimitOrder) && <div className="grid md:grid-cols-3 grid-cols-1 w-full md:gap-3 gap-y-3 mb-3">
                <div className="flex flex-col gap-2 col-span-1 w-full">
                    {<div className="flex flex-col gap-1.5 col-span-1 w-full bg-dark-gradient border border-card-border p-2 rounded-xl">
                        {<SwapPair derivedSwap={derivedSwap} />}
                        
                        {isSwap && <SwapParams derivedSwap={derivedSwap} />}
                        {isSwap && <SwapButton derivedSwap={derivedSwap} />}

                        {isLimitOrder && <LimitOrder derivedSwap={derivedSwap} />}
                    </div>}
                    <PoweredByAlgebra />
                </div>
                <div className="flex flex-col col-span-2 md:max-h-[514px]">
                    {
                        isPredictionPool ?
                            <PredictionChart derivedSwap={derivedSwap} /> :
                            <SwapChart derivedSwap={derivedSwap} />
                    }
                </div>
            </div> }

            {isPrediction && (<div className="w-full">
                <PredictionMarkets />
            </div>)}

            {isLimitOrder && <LimitOrdersList />}

        </PageContainer>
    );
};

export default SwapPage;
