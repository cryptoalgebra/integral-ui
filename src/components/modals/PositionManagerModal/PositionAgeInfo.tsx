import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { HoverCardPortal } from "@radix-ui/react-hover-card";
import { PositionAnalytics } from "@/hooks/positions/usePositionAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useMediaQuery } from "@/hooks/common/useMediaQuery";
import { formatAmount } from "@/utils";

interface PositionAgeInfoProps {
    positionAnalytics: PositionAnalytics | undefined;
}

const metricCardClass =
    "group flex w-full cursor-pointer flex-col gap-1 rounded-lg bg-panel p-2 transition-colors duration-150 hover:bg-panel-hover";

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
    const isMobile = useMediaQuery("(max-width: 767px)");

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
            <div className={metricCardClass}>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-text-muted">Active for</span>
                    <Clock className="h-3 w-3 text-text-muted" />
                </div>
                <Skeleton className="h-5 w-16 rounded-md bg-card" />
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
            openDelay={120}
            closeDelay={120}
        >
            <div ref={cardRef}>
                <HoverCardTrigger onClick={() => isMobile && setIsOpen(!isOpen)} asChild>
                    <div className={metricCardClass}>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-[0.14em] text-text-muted">Active for</span>
                            <Clock className="h-3 w-3 text-text-muted" />
                        </div>
                        <span className="text-base font-medium text-text">{formatPositionAge(positionAge)}</span>
                    </div>
                </HoverCardTrigger>
                <HoverCardPortal>
                    <HoverCardContent
                        side="bottom"
                        className="w-[250px] max-w-[90vw] gap-2 rounded-xl border border-border bg-card p-3 text-xs shadow-sm"
                    >
                        <p className="text-left text-[11px] text-text-muted">Timeline summary for this liquidity position.</p>
                        <div className="flex flex-col gap-1 rounded-lg border border-border bg-panel p-2.5 text-[11px]">
                            <div className="flex justify-between">
                                <span className="text-text-muted">Opened on</span>
                                <span>{createdOn}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Duration</span>
                                <span>{formatPositionAge(positionAge)}</span>
                            </div>

                            <hr className="my-1 border-border" />

                            <div className="flex justify-between">
                                <span className="text-text-muted">Initial deposit</span>
                                <span>${formatAmount(initialAmount.usdValue, 4)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Current value</span>
                                <span className={valueChangeUsd >= 0 ? "text-emerald-600" : "text-text-muted"}>
                                    ${formatAmount(currentAmount.usdValue, 4)}
                                    <span className="ml-1 text-[10px]">
                                        ({valueChangeSign}${formatAmount(Math.abs(valueChangeUsd), 2)})
                                    </span>
                                </span>
                            </div>

                            <hr className="my-1 border-border" />

                            <div className="flex justify-between">
                                <span className="text-primary-hover">Earned fees</span>
                                <span>${formatAmount(totalFeesUsd, 4)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-muted">Avg daily fees</span>
                                <span>${formatAmount(avgDailyFeesUsd, 4)}</span>
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCardPortal>
            </div>
        </HoverCard>
    );
}
