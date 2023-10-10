import { SwapPageProps, SwapPageView } from "./types";
import SwapPair from "@/components/swap/SwapPair";
import SwapButton from "@/components/swap/SwapButton";
import SwapParams from "@/components/swap/SwapParams";
import SwapChart from "@/components/swap/SwapChart";
import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import IntegralPools from "@/components/swap/IntegralPools";
import LimitOrdersList from "@/components/limit-orders/LimitOrdersList";
import LimitOrder from "@/components/limit-orders/LimitOrder";

const SwapPage = ({ type }: SwapPageProps) => {

    const isLimitOrder = type === SwapPageView.LIMIT_ORDER

    return <PageContainer>

        <PageTitle>
            {isLimitOrder ? 'Limit Order' : 'Swap'}
        </PageTitle>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-0 gap-y-8 w-full lg:gap-8 mt-8 lg:mt-16">

            <div className="flex flex-col gap-2">

                <IntegralPools />

                <div className="flex flex-col gap-1 w-full bg-card border border-card-border p-2 rounded-3xl">
                    <SwapPair />
                    {isLimitOrder ? <LimitOrder /> : <SwapParams />}
                    {!isLimitOrder && <SwapButton />}
                </div>
            </div>

            <div className="col-span-2">
                <SwapChart />
            </div>

        </div>

        {isLimitOrder && <div className="w-full mt-12">
            <LimitOrdersList />
        </div>}

    </PageContainer>

}

export default SwapPage;