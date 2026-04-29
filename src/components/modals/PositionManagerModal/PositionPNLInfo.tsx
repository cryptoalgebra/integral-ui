import { HoverCardPortal } from "@radix-ui/react-hover-card";
import type { Currency } from "@cryptoalgebra/integral-sdk";
import { TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/common/useMediaQuery";
import { PositionAnalytics, TokenValue } from "@/hooks/positions/usePositionAnalytics";
import { cn, formatAmount } from "@/utils";

const metricCardClass =
    "group flex w-full cursor-pointer flex-col gap-1 rounded-lg bg-panel p-2 transition-colors duration-150 hover:bg-panel-hover";

function Row({
    token0,
    token1,
    label,
    usdValue,
    value0,
    value1,
    positive,
    isPercent,
    view,
}: {
    token0: Currency;
    token1: Currency;
    label: string;
    usdValue: number;
    value0: number;
    value1: number;
    positive?: boolean;
    isPercent?: boolean;
    view: "usd" | "token0" | "token1";
}) {
    const usdText = `${usdValue >= 0 ? (positive ? "+" : "") : "-"}${isPercent ? "" : "$"}${formatAmount(Math.abs(usdValue), 4)}${
        isPercent ? "%" : ""
    }`;
    const value0Text = `${value0 >= 0 ? (positive ? "+" : "") : "-"}${formatAmount(Math.abs(value0), 4)}${isPercent ? "%" : ""}`;
    const value1Text = `${value1 >= 0 ? (positive ? "+" : "") : "-"}${formatAmount(Math.abs(value1), 4)}${isPercent ? "%" : ""}`;

    const isFees = label === "Earned fees";
    const isPnlRow = label === "Unrealized PnL";

    return (
        <div className="flex w-full items-center gap-3">
            <span className={cn("text-text-muted", isFees && "text-primary-hover")}>{label}</span>

            {view === "usd" && (
                <div
                    className={cn(
                        "ml-auto flex items-center justify-end",
                        positive && (usdValue >= 0 ? "text-emerald-600" : "text-text-muted"),
                    )}
                >
                    {usdText}
                </div>
            )}

            {view === "token0" && (
                <div
                    className={cn(
                        "ml-auto flex items-center justify-end gap-1",
                        (isPercent || isPnlRow) && value0 >= 0
                            ? "text-emerald-600"
                            : value0 < 0
                              ? "text-text-muted"
                              : "text-text",
                    )}
                >
                    {!isPercent && <CurrencyLogo size={14} currency={token0} />}
                    {value0Text}
                </div>
            )}

            {view === "token1" && (
                <div
                    className={cn(
                        "ml-auto flex items-center justify-end gap-1",
                        (isPercent || isPnlRow) && value1 >= 0
                            ? "text-emerald-600"
                            : value1 < 0
                              ? "text-text-muted"
                              : "text-text",
                    )}
                >
                    {!isPercent && <CurrencyLogo size={14} currency={token1} />}
                    {value1Text}
                </div>
            )}
        </div>
    );
}

export function PositionPNLInfo({
    token0,
    token1,
    positionAnalytics,
}: {
    token0: Currency | null | undefined;
    token1: Currency | null | undefined;
    positionAnalytics: PositionAnalytics | undefined;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentView, setCurrentView] = useState<"usd" | "token0" | "token1">("usd");
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

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMobile]);

    if (!positionAnalytics || !token0 || !token1)
        return (
            <div className={metricCardClass}>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.14em] text-text-muted">Performance</span>
                    <TrendingUp className="h-3 w-3 text-text-muted" />
                </div>
                <Skeleton className="h-5 w-20 rounded-md bg-card" />
            </div>
        );

    const { initialAmount, currentAmount, withdrawnAmount, collectedFees, pendingFees, il, pnl, roi } = positionAnalytics;

    const summary: TokenValue = {
        usdValue: currentAmount.usdValue + collectedFees.usdValue + pendingFees.usdValue + withdrawnAmount.usdValue,
        value0: currentAmount.value0 + collectedFees.value0 + pendingFees.value0 + withdrawnAmount.value0,
        value1: currentAmount.value1 + collectedFees.value1 + pendingFees.value1 + withdrawnAmount.value1,
    };

    const pnlValue = pnl.usdValue;
    const pnlTrend = pnlValue > 0 ? "up" : pnlValue < 0 ? "down" : "neutral";
    const pnlSign = pnlValue > 0 ? "+" : pnlValue < 0 ? "-" : "";

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
                            <span className="text-[10px] uppercase tracking-[0.14em] text-text-muted">Performance</span>
                            <TrendingUp className="h-3 w-3 text-text-muted" />
                        </div>
                        <span
                            className={cn(
                                "text-base font-medium",
                                pnlTrend === "up" ? "text-emerald-600" : pnlTrend === "down" ? "text-text-muted" : "text-text",
                            )}
                        >
                            {pnlSign}${formatAmount(Math.abs(pnlValue), 4)}
                        </span>
                    </div>
                </HoverCardTrigger>

                <HoverCardPortal>
                    <HoverCardContent
                        side="bottom"
                        className="w-[250px] max-w-[92vw] gap-2 rounded-xl border border-border bg-card p-3 text-xs shadow-sm"
                    >
                        <p className="text-left text-[11px] text-text-muted">
                            Detailed view of your position performance, including value changes, fees, and ROI.
                        </p>

                        <p className="text-left text-[11px] text-text-muted">View results in</p>

                        <div className="flex w-full gap-1 rounded-lg border border-border p-1">
                            <Button
                                className="h-7 flex-1 rounded-md px-2 text-[11px] font-medium"
                                variant={currentView === "usd" ? "iconHover" : "icon"}
                                onClick={() => setCurrentView("usd")}
                            >
                                <span>$ USD</span>
                            </Button>
                            <Button
                                className="h-7 flex-1 gap-1 rounded-md px-2 text-[11px] font-medium"
                                variant={currentView === "token0" ? "iconHover" : "icon"}
                                onClick={() => setCurrentView("token0")}
                            >
                                <CurrencyLogo currency={token0} size={14} />
                                <span>{token0.symbol}</span>
                            </Button>
                            <Button
                                className="h-7 flex-1 gap-1 rounded-md px-2 text-[11px] font-medium"
                                variant={currentView === "token1" ? "iconHover" : "icon"}
                                onClick={() => setCurrentView("token1")}
                            >
                                <CurrencyLogo currency={token1} size={14} />
                                <span>{token1.symbol}</span>
                            </Button>
                        </div>

                        <div className="flex flex-col gap-1 rounded-lg border border-border bg-panel p-2.5 text-[11px]">
                            <Row token0={token0} token1={token1} label="Initial deposit" view={currentView} {...initialAmount} />
                            <Row token0={token0} token1={token1} label="Earned fees" view={currentView} {...pendingFees} />

                            {collectedFees.usdValue > 0 && (
                                <Row token0={token0} token1={token1} label="Collected fees" view={currentView} {...collectedFees} />
                            )}

                            <Row token0={token0} token1={token1} label="Overall value" view={currentView} {...summary} />

                            <hr className="my-1 border-border" />

                            <Row token0={token0} token1={token1} label="Impermanent Loss" view={currentView} positive {...il} />
                            <Row token0={token0} token1={token1} label="Unrealized PnL" view={currentView} positive {...pnl} />
                            <Row token0={token0} token1={token1} label="ROI, %" view={currentView} positive isPercent {...roi} />
                        </div>
                    </HoverCardContent>
                </HoverCardPortal>
            </div>
        </HoverCard>
    );
}
