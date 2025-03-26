import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tractor, TrendingUpIcon, ZapIcon } from "lucide-react";

export const DynamicFeePluginIcon = () => (
    <HoverCard>
        <HoverCardTrigger>
            <div className="text-sm h-fit py-2">
                <ZapIcon size={16} fill={"#d84eff"} stroke={"#d84eff"} />
            </div>
        </HoverCardTrigger>
        <HoverCardContent className="flex flex-col gap-2 bg-card rounded-3xl border border-card-border text-white w-fit">
            <div className="flex items-center gap-2">
                <ZapIcon size={16} fill={"#d84eff"} stroke={"#d84eff"} />
                <span className="font-bold">Dynamic Fees</span>
            </div>
            <div className="text-left">
                This pool uses <b>Dynamic Fees</b> plugin
            </div>
            <a
                className="w-fit text-left text-cyan-300 hover:underline"
                href={"https://docs.algebra.finance/algebra-integral/core-logic/plugins"}
                target={"_blank"}
            >
                Learn more →
            </a>
        </HoverCardContent>
    </HoverCard>
);

export const LimitOrderPluginIcon = () => (
    <HoverCard>
        <HoverCardTrigger>
            <div className="text-sm h-fit p-2">
                <TrendingUpIcon size={16} stroke={"#29ff69"} />
            </div>
        </HoverCardTrigger>
        <HoverCardContent className="flex flex-col gap-2 bg-card rounded-3xl border border-card-border text-white w-fit">
            <div className="flex items-center">
                <LimitOrderPluginIcon />
                <span className="font-bold">Limit Orders</span>
            </div>
            <div className="text-left">
                This pool uses <b>Limit Orders</b> plugin
            </div>
            <a
                className="w-fit text-left text-cyan-300 hover:underline"
                href={"https://cryptoalgebra.gitbook.io/algebra-integral/core-logic/plugins"}
                target={"_blank"}
            >
                Learn more →
            </a>
        </HoverCardContent>
    </HoverCard>
);

export const FarmingPluginIcon = () => (
    <HoverCard>
        <HoverCardTrigger>
            <div className="text-sm h-fit py-2">
                <Tractor size={16} stroke={"#d84eff"} />
            </div>
        </HoverCardTrigger>
        <HoverCardContent className="flex flex-col gap-2 bg-card rounded-3xl border border-card-border text-white w-fit">
            <div className="flex items-center gap-2">
                <Tractor size={16} stroke={"#d84eff"} />
                <span className="font-bold">Built-in Farming</span>
            </div>
            <div className="text-left">
                This pool uses <b>Built-in Farming</b> plugin
            </div>
            <a
                className="w-fit text-left text-cyan-300 hover:underline"
                href={"https://docs.algebra.finance/algebra-integral/core-logic/plugins"}
                target={"_blank"}
            >
                Learn more →
            </a>
        </HoverCardContent>
    </HoverCard>
);
