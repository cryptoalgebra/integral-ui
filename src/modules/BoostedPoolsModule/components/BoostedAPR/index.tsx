import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Zap } from "lucide-react";
import { formatAmount } from "@/utils/common/formatAmount";

interface BoostedAPRProps {
    token0Apr?: number;
    token1Apr?: number;
    token0Name?: string;
    token1Name?: string;
    baseAPR?: number;
}

export function BoostedAPR({ token0Apr, token1Apr, token0Name, token1Name, baseAPR }: BoostedAPRProps) {
    const boostedAPR = (token0Apr || 0) + (token1Apr || 0);
    const totalAPR = (baseAPR || 0) + boostedAPR;

    if (!token0Apr && !token1Apr) return null;

    return (
        <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-pointer group">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500 text-purple-900 text-xs font-semibold transition-all duration-200 group-hover:from-purple-500/30 group-hover:to-blue-500/30 group-hover:border-purple-500/60">
                        <Zap size={10} className="text-purple-900" />
                        <span>+{formatAmount(boostedAPR, 2)}%</span>
                    </div>
                </div>
            </HoverCardTrigger>
            <HoverCardContent side="top" className="w-[280px] p-4">
                <div className="space-y-3">
                    <span className="font-semibold text-sm">Boosted Pool APR</span>

                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="opacity-70">Base Pool APR</span>
                            <span className="font-medium">{formatAmount(baseAPR || 0, 2)}%</span>
                        </div>

                        {token0Apr ? (
                            <div className="flex justify-between items-center">
                                <span className="opacity-70 flex items-center gap-1">
                                    <Zap size={10} className="text-purple-900" />
                                    {token0Name || "Token0 Vault"}
                                </span>
                                <span className="font-medium text-purple-800">+{formatAmount(token0Apr, 2)}%</span>
                            </div>
                        ) : null}

                        {token1Apr ? (
                            <div className="flex justify-between items-center">
                                <span className="opacity-70 flex items-center gap-1">
                                    <Zap size={10} className="text-purple-900" />
                                    {token1Name || "Token1 Vault"}
                                </span>
                                <span className="font-medium text-purple-800">+{formatAmount(token1Apr, 2)}%</span>
                            </div>
                        ) : null}

                        <div className="pt-1 border-t border-white/10">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Total APR</span>
                                <span className="font-bold">{formatAmount(totalAPR, 2)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
