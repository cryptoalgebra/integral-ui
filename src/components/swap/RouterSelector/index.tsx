import { Button } from "@/components/ui/button";
import { RouterType, useSwapState } from "@/state/swapStore";
import { cn } from "@/utils";
import { Zap } from "lucide-react";

export function RouterSelector() {
    const {
        routerType,
        actions: { setRouterType },
    } = useSwapState();

    return (
        <div className="flex items-center w-full gap-2 ">
            <Button
                size={"sm"}
                variant={routerType === RouterType.OMEGA ? "secondary" : "ghost"}
                onClick={() => setRouterType(RouterType.OMEGA)}
                className={cn(
                    "w-full h-full min-h-10 border border-card-border gap-2",
                    routerType === RouterType.OMEGA ? "bg-card hover:bg-card" : "text-text-100/80"
                )}
            >
                <Zap className="text-purple-800" size={16} />
                Omega Router
            </Button>
            <Button
                size={"sm"}
                variant={routerType === RouterType.NATIVE ? "secondary" : "ghost"}
                onClick={() => setRouterType(RouterType.NATIVE)}
                className={cn(
                    "w-full h-full min-h-10 border border-card-border",
                    routerType === RouterType.NATIVE ? "bg-card hover:bg-card" : "text-text-100/80"
                )}
            >
                Native Router
            </Button>
        </div>
    );
}
