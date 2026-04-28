import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { HoverCardPortal } from "@radix-ui/react-hover-card";
import { PositionAnalytics } from "@/hooks/positions/usePositionAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatAmount } from "@/utils";

interface PositionAgeInfoProps {
    positionAnalytics: PositionAnalytics | undefined;
}

function getCreationDate(positionAgeDays: number): string {
    const ms = positionAgeDays * 24 * 60 * 60 * 1000;
    return new Date(Date.now() - ms).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatPositionAge(days: number | undefined | null): string {
    if (!days || days <= 0) return "< 1m";

    const totalMinutes = Math.floor(days * 24 * 60);
    const totalHours = Math.floor(days * 24);
    const totalDays = Math.floor(days);

    // Less than 1 hour - show minutes
    if (totalHours < 1) {
        return `${totalMinutes}m`;
    }

    // Less than 1 day - show hours and minutes
    if (totalDays < 1) {
        const hours = totalHours;
        const minutes = totalMinutes % 60;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
    }

    // Less than 1 week - show days and hours

    const remainingHours = totalHours % 24;
    if (remainingHours === 0) return `${totalDays}d`;
    return `${totalDays}d ${remainingHours}h`;
}

export function PositionAgeInfo({ positionAnalytics }: PositionAgeInfoProps) {
    const [isOpen, setIsOpen] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const isMobile = window.innerWidth < 768;

    useEffect(() => {
        if (!isMobile) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        // eslint-disable-next-line consistent-return
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMobile]);

    if (!positionAnalytics)
        return (
            <div className="flex flex-col gap-1 rounded-lg group p-3 hover:bg-card-hover/60 cursor-pointer transition-all duration-200 bg-card-hover/50 border border-card-border">
                <div className="flex items-center justify-between">
                    <span className="text-text/50 uppercase tracking-wider text-xs">Active for</span>
                    <Clock className="w-3.5 h-3.5 text-text/40" />
                </div>
                <Skeleton className="h-6 w-16 rounded-md bg-card-hover" />
            </div>
        );

    const { positionAge, collectedFees, pendingFees, initialAmount, currentAmount } = positionAnalytics;

    const totalFeesUsd = collectedFees.usdValue + pendingFees.usdValue;
    const avgDailyFeesUsd = positionAge > 0 ? totalFeesUsd / positionAge : 0;
    const createdOn = getCreationDate(positionAge);
    const valueChangeUsd = currentAmount.usdValue - initialAmount.usdValue;
    const valueChangeSign = valueChangeUsd >= 0 ? "+" : "";

    return (
        <HoverCard
            open={isMobile ? isOpen : undefined}
            onOpenChange={(open) => !isMobile && setIsOpen(open)}
            openDelay={200}
            closeDelay={200}
        >
            <div ref={cardRef}>
                <HoverCardTrigger onClick={() => isMobile && setIsOpen(!isOpen)} asChild>
                    <div className="flex flex-col gap-1 rounded-lg group p-3 hover:bg-card-hover/60 cursor-pointer transition-all duration-200 bg-card-hover/50 border border-card-border">
                        <div className="flex items-center justify-between">
                            <span className="text-text/50 uppercase tracking-wider text-xs">Active for</span>
                            <Clock className="w-3.5 h-3.5 text-text/40" />
                        </div>
                        <span className="text-lg font-medium">{formatPositionAge(positionAge)}</span>
                    </div>
                </HoverCardTrigger>
                <HoverCardPortal>
                    <HoverCardContent side="bottom" className="w-60 text-sm">
                        <p className="text-left text-xs opacity-50">Timeline summary for this liquidity position.</p>
                        <div className="flex flex-col gap-1 rounded-lg bg-card-dark/50  p-2 text-xs">
                            <div className="flex justify-between">
                                <span className="opacity-50">Opened on</span>
                                <span>{createdOn}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-50">Duration</span>
                                <span>{formatPositionAge(positionAge)}</span>
                            </div>

                            <hr className="mt-1 border-card-border" />

                            <div className="flex justify-between">
                                <span className="opacity-50">Initial deposit</span>
                                <span>${formatAmount(initialAmount.usdValue, 4)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-50">Current value</span>
                                <span className={valueChangeUsd >= 0 ? "text-green-400" : "text-text/60"}>
                                    ${formatAmount(currentAmount.usdValue, 4)}
                                    <span className="ml-1 text-[10px]">
                                        ({valueChangeSign}${formatAmount(Math.abs(valueChangeUsd), 2)})
                                    </span>
                                </span>
                            </div>

                            <hr className="mt-1 border-card-border" />

                            <div className="flex justify-between">
                                <span className="text-primary">Earned fees</span>
                                <span>${formatAmount(totalFeesUsd, 4)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-50">Avg daily fees</span>
                                <span>${formatAmount(avgDailyFeesUsd, 4)}</span>
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCardPortal>
            </div>
        </HoverCard>
    );
}
