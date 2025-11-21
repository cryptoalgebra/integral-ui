import Settings from "@/components/common/Settings";
import { cn } from "@/utils";
import { NavLink } from "react-router-dom";

export function SwapTypeSelector({ isLimitOrder }: { isLimitOrder: boolean }) {
    return (
        <div className="border-b w-full md:mb-12">
            <div className="w-full max-w-[1280px] mx-auto flex items-center text-xl md:text-3xl justify-between md:my-12 mb-4">
                <div className="w-fit flex gap-8 items-center">
                    <NavLink className="w-full h-full" to="/swap">
                        <h1
                            className={cn(
                                "leading-tight text-primary  duration-200 whitespace-nowrap font-semibold",
                                isLimitOrder ? "text-muted-foreground/70 hover:text-primary/80" : "text-primary"
                            )}
                        >
                            Swap
                        </h1>
                    </NavLink>
                    <div className="h-8 w-[2px] bg-muted" />
                    <NavLink className="w-full h-full" to="/limit-order">
                        <h1
                            className={cn(
                                "leading-tight text-primary  duration-200 whitespace-nowrap font-semibold",
                                !isLimitOrder ? "text-muted-foreground/70 hover:text-primary/80" : "text-primary"
                            )}
                        >
                            Limit Order
                        </h1>
                    </NavLink>
                </div>

                <Settings />
            </div>
        </div>
    );
}
