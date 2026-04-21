import { cn } from "@/utils";
import { NavLink } from "react-router-dom";

export function SwapTypeSelector({ isLimitOrder }: { isLimitOrder: boolean }) {
    return (
        <div className="flex items-center gap-5 whitespace-nowrap text-sm font-medium tracking-[2px] uppercase">
            <NavLink
                className={cn("transition-colors duration-200", isLimitOrder ? "text-text-muted hover:text-text" : "text-text")}
                to="/swap"
            >
                Trade
            </NavLink>
            {/* <NavLink
                className={cn("transition-colors duration-200", isLimitOrder ? "text-primary" : "text-text-muted hover:text-text")}
                to="/limit-order"
            >
                Limit Order
            </NavLink> */}
        </div>
    );
}
