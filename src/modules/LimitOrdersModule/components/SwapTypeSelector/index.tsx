import { cn } from "@/utils";
import { NavLink } from "react-router-dom";

export function SwapTypeSelector({ isLimitOrder }: { isLimitOrder: boolean }) {
    return (
        <div className="flex items-center h-full col-span-1 max-h-16 text-4xl font-bold rounded-xl whitespace-nowrap">
            <NavLink className="w-full h-full" to="/swap">
                <h1
                    className={cn(
                        "leading-tight bg-gradient-to-t bg-clip-text text-transparent pr-8 duration-200",
                        isLimitOrder ? "from-text-300 to-text-400 hover:opacity-70" : "from-primary-100 to-primary-200"
                    )}
                >
                    Swap
                </h1>
            </NavLink>
            <div className="flex items-center h-full pt-1">
                <div className="w-2 h-2 bg-text-100/5 border border-text-100/25 rotate-45" />
            </div>
            <NavLink className={"w-full h-full"} to="/limit-order">
                <h1
                    className={cn(
                        "leading-tight bg-gradient-to-b bg-clip-text text-transparent pl-8 duration-200",
                        isLimitOrder ? "from-primary-100 to-primary-200" : "from-text-300 to-text-400 hover:opacity-70"
                    )}
                >
                    Limit Order
                </h1>
            </NavLink>
        </div>
    );
}
