import SwapPair from "@/components/swap/SwapPair";
import SwapButton from "@/components/swap/SwapButton";
import SwapParams from "@/components/swap/SwapParams";
import PageContainer from "@/components/common/PageContainer";
import PoweredByAlgebra from "@/components/common/PoweredByAlgebra";
import { useDerivedSwapInfo } from "@/state/swapStore.ts";
import { SwapPageProps, SwapPageView } from "./types";
import SwapChart from "@/components/swap/SwapChart";

import LimitOrdersModule from "@/modules/LimitOrdersModule";
const { LimitOrder, SwapTypeSelector, LimitOrdersList } = LimitOrdersModule.components;

const SwapPage = ({ type }: SwapPageProps) => {
    const isLimitOrder = type === SwapPageView.LIMIT_ORDER;

    const derivedSwap = useDerivedSwapInfo();

    return (
        <PageContainer>
            <div className="grid grid-flow-col max-md:flex max-md:flex-col-reverse auto-cols-fr w-fit gap-3 mb-8">
                <SwapTypeSelector isLimitOrder={isLimitOrder} />
            </div>
            <div className="grid md:grid-cols-3 grid-cols-1 w-full md:gap-3 gap-y-3 mb-3">
                <div className="flex flex-col gap-2 col-span-1 w-full">
                    <div className="flex flex-col gap-1.5 col-span-1 w-full bg-dark-gradient border border-card-border p-2 rounded-xl">
                        <SwapPair derivedSwap={derivedSwap} />
                        {isLimitOrder ? <LimitOrder derivedSwap={derivedSwap} /> : <SwapParams derivedSwap={derivedSwap} />}
                        {!isLimitOrder && <SwapButton derivedSwap={derivedSwap} />}
                    </div>
                    <PoweredByAlgebra />
                </div>
                <div className="flex flex-col gap-3 col-span-2 md:max-h-[514px]">
                    <SwapChart derivedSwap={derivedSwap} />
                </div>
            </div>
            {isLimitOrder && <LimitOrdersList />}
        </PageContainer>
    );
};

export default SwapPage;
