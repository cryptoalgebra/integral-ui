import { cn } from "@/utils";
import { enabledModules } from "config";
import { NavLink } from "react-router-dom";

export function SwapTypeSelector({
    isSwap,
    isLimitOrder,
    isPrediction,
}: {
    isSwap: boolean;
    isLimitOrder: boolean;
    isPrediction: boolean;
}) {
    return (
        <div className="w-full overflow-x-auto">
            <div className="flex items-center min-w-max h-full max-h-16 text-xl sm:text-2xl md:text-4xl font-bold rounded-xl">
                <NavLink className="h-full shrink-0" to="/swap">
                    <h1
                        className={cn(
                            "leading-tight bg-gradient-to-t bg-clip-text text-transparent pr-4 sm:pr-6 md:pr-8 duration-200",
                            isSwap ? "from-primary-100 to-primary-200" : "from-text-300 to-text-400 hover:opacity-70",
                        )}
                    >
                        Swap
                    </h1>
                </NavLink>

                {enabledModules.LimitOrdersModule && (
                    <>
                        <Divider />
                        <NavLink className="h-full shrink-0" to="/limit-order">
                            <h1
                                className={cn(
                                    "leading-tight bg-gradient-to-b bg-clip-text text-transparent px-4 sm:px-6 md:px-8 duration-200",
                                    isLimitOrder ? "from-primary-100 to-primary-200" : "from-text-300 to-text-400 hover:opacity-70",
                                )}
                            >
                                Limit Order
                            </h1>
                        </NavLink>
                    </>
                )}

                {enabledModules.PredictionModule && (
                    <>
                        <Divider />
                        <NavLink className="h-full shrink-0" to="/prediction">
                            <h1
                                className={cn(
                                    "leading-tight bg-gradient-to-b bg-clip-text text-transparent pl-4 sm:pl-6 md:pl-8 duration-200",
                                    isPrediction ? "from-primary-100 to-primary-200" : "from-text-300 to-text-400 hover:opacity-70",
                                )}
                            >
                                Prediction
                            </h1>
                        </NavLink>
                    </>
                )}
            </div>
        </div>
    );
}

function Divider() {
    return (
        <div className="flex items-center h-full px-2 shrink-0">
            <div className="w-2 h-2 bg-text-100/5 border border-text-100/25 rotate-45" />
        </div>
    );
}
