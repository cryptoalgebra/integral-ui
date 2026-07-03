import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export function NAVHookHeaderInfo() {
    return (
        <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-7 items-center text-sm font-semibold text-text-200">
                        <div className="animate-pulse w-2 h-2 rounded-full bg-emerald-300 mr-2" /> Managed by Price Convergence
                    </span>
                </div>
            </HoverCardTrigger>
            <HoverCardContent side="bottom" className="w-[320px] p-3 text-sm">
                <p className="text-left text-sm font-semibold">Price Convergence plugin</p>
                <p className="mt-1 text-left text-xs leading-relaxed text-text-300">
                    This pool does not use manual LP ranges. You deposit into a vault, receive share tokens, and the plugin manages liquidity
                    around the oracle price.
                </p>
            </HoverCardContent>
        </HoverCard>
    );
}
