import TokenSelectorModal from "@/components/modals/TokenSelectorModal";
import { SwapPageProps, SwapPageView } from "./types";
import SwapPair from "@/components/swap/SwapPair";
import SwapButton from "@/components/swap/SwapButton";
import SwapParams from "@/components/swap/SwapParams";
import SwapChart from "@/components/swap/SwapChart";
import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import IntegralPools from "@/components/swap/IntegralPools";
import { NavLink } from "react-router-dom";
import LimitOrdersList from "@/components/limit-orders/LimitOrdersList";
import LimitOrder from "@/components/limit-orders/LimitOrder";
import LimitOrderButton from "@/components/limit-orders/LimitOrderButton";

const SwapPage = ({ type }: SwapPageProps) => {

    const isLimitOrder = type === SwapPageView.LIMIT_ORDER

    return <PageContainer>

        <div className="flex gap-8">
            <PageTitle>
                <NavLink to={'/swap'} className={({ isActive }) => isActive ? "text-white" : "text-gray-500"}>Swap</NavLink>
            </PageTitle>
            <PageTitle>
                <NavLink to={'/limit-order'} className={({ isActive }) => isActive ? "text-white" : "text-gray-500"}>Limit Order</NavLink>
            </PageTitle>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full mt-16">

            <div className="flex flex-col gap-2">

                <IntegralPools />

                <div className="flex flex-col gap-1 w-full bg-card border border-card-border p-2 rounded-3xl">
                    <SwapPair />
                    {isLimitOrder ? <LimitOrder /> : <SwapParams />}
                    {!isLimitOrder && <SwapButton />  }
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