import SwapPair from "@/components/swap/SwapPair";
import SwapButton from "@/components/swap/SwapButton";
import SwapParams from "@/components/swap/SwapParams";
import PageContainer from "@/components/common/PageContainer";
import { useDerivedSwapInfo } from "@/state/swapStore.ts";
import { SwapPageProps, SwapPageView } from "./types";

import LimitOrdersModule from "@/modules/LimitOrdersModule";
import { TradeState } from "@/types/trade-state";
import { cn } from "@/utils";
import { NavLink } from "react-router-dom";
const { LimitOrder, LimitOrdersList } = LimitOrdersModule.components;

const SwapPage = ({ type }: SwapPageProps) => {
    const isLimitOrder = type === SwapPageView.LIMIT_ORDER;

    const derivedSwap = useDerivedSwapInfo();

    return (
        <PageContainer>
            <div className="relative flex w-full flex-col items-center pt-4 md:pt-10">
                <div
                    className={cn(
                        "pointer-events-none inset-x-0 top-0 absolute max-md:hidden flex justify-center animate-fade-in transition-opacity duration-500",
                        !isLimitOrder && derivedSwap.tradeState.state !== TradeState.VALID ? "opacity-100" : "opacity-0",
                    )}
                >
                    <div className="ml-40 mt-10 md:h-120 md:w-120 rounded-full absolute bg-primary opacity-10 blur-3xl" />
                    <div className="ml-0 mt-20 md:h-120 md:w-120 rounded-full absolute bg-purple-800/30 opacity-10 blur-3xl" />
                    <div className="mr-40 mt-10 md:h-120 md:w-120 rounded-full absolute bg-accent/30 opacity-10 blur-3xl" />
                </div>

                <div className="relative w-full max-w-lg">
                    <div className="mb-4 flex flex-col gap-3 px-1">
                        <div className="flex items-center gap-5 whitespace-nowrap text-sm font-medium tracking-[2px] uppercase">
                            <NavLink
                                className={cn(
                                    "transition-colors duration-200",
                                    isLimitOrder ? "text-text-muted hover:text-text" : "text-text",
                                )}
                                to="/swap"
                            >
                                Trade
                            </NavLink>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-sm transition-all duration-300 ease-out hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                        <div className="relative flex flex-col gap-2">
                            <SwapPair derivedSwap={derivedSwap} />
                            {!isLimitOrder && <SwapButton derivedSwap={derivedSwap} />}
                            {isLimitOrder ? <LimitOrder derivedSwap={derivedSwap} /> : <SwapParams derivedSwap={derivedSwap} />}
                        </div>
                    </div>

                    {/* <PoweredByAlgebra className="mx-auto mt-3 w-fit justify-center text-text-muted opacity-80 hover:opacity-100" /> */}
                </div>

                {isLimitOrder && (
                    <div className="mt-12 w-full">
                        <LimitOrdersList />
                    </div>
                )}
            </div>
        </PageContainer>
    );
};

export default SwapPage;
