import { SwapPageView, SwapPageViewType } from "@/pages/Swap/types";
import { cn } from "@/utils";
import { enabledModules } from "config";
import { NavLink } from "react-router-dom";

type Tab = {
    to: string;
    label: string;
    value: SwapPageViewType;
    enabled?: boolean;
};

const tabs: Tab[] = [
    { to: "/swap", label: "Swap", value: SwapPageView.SWAP },
    {
        to: "/limit-order",
        label: "Limit",
        value: SwapPageView.LIMIT_ORDER,
        enabled: enabledModules.LimitOrdersModule,
    },
    {
        to: "/prediction",
        label: "Prediction",
        value: SwapPageView.PREDICTION,
        enabled: enabledModules.PredictionModule,
    },
];

export function SwapTypeSelector({ type }: { type: SwapPageViewType }) {
    const visibleTabs = tabs.filter((t) => t.enabled !== false);
    const activeIndex = visibleTabs.findIndex((t) => t.value === type);

    return (
        <div className="relative flex w-fit rounded-xl bg-card-light overflow-hidden">
            {visibleTabs.map((tab) => {
                const isActive = tab.value === type;

                return (
                    <NavLink key={tab.to} to={tab.to} className="relative z-10">
                        <button
                            className={cn(
                                "px-6 py-3  text-sm font-medium",
                                isActive ? "text-text bg-card-border/40" : "text-text-300 hover:text-text",
                                activeIndex === 0 && "rounded-l-xl",
                                activeIndex === visibleTabs.length - 1 && "rounded-r-xl",
                            )}
                        >
                            {tab.label}
                        </button>
                    </NavLink>
                );
            })}
        </div>
    );
}
