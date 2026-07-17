import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export const KycTag = () => (
    <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
            <div className="flex h-[26px] w-fit cursor-pointer items-center justify-center rounded-full border border-cyan-700 bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 duration-200 hover:opacity-80 max-md:text-xs">
                KYC
            </div>
        </HoverCardTrigger>
        <HoverCardContent side="top" className="w-[300px] p-3 text-sm">
            <p className="text-left text-sm font-semibold">Demo KYC pool</p>
            <p className="mt-1 text-left text-xs leading-relaxed text-text-300">
                Swaps and liquidity deposits in this pool require an Onchain ID with a valid Demo KYC claim.
            </p>
        </HoverCardContent>
    </HoverCard>
);
