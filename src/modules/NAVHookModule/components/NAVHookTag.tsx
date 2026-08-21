import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export function NAVHookTag() {
    return (
        <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div className="flex h-[26px] w-fit cursor-pointer items-center justify-center rounded-full border border-emerald-700 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-700 duration-200 hover:opacity-80 max-md:text-xs">
                    NAV
                </div>
            </HoverCardTrigger>
            <HoverCardContent side="top" className="w-[300px] p-3 text-sm">
                <p className="text-left text-sm font-semibold">Price Convergence plugin</p>
                <p className="mt-1 text-left text-xs leading-relaxed text-text-300">
                    This pool uses the Price Convergence Plugin which enhances AMM price discovery by applying external price data.
                </p>
            </HoverCardContent>
        </HoverCard>
    );
}
