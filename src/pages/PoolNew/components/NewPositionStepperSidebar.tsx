import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useDerivedMintInfo, useMintState } from "@/state/mintStore";
import { cn } from "@/utils";
import { INITIAL_POOL_FEE, Field } from "@cryptoalgebra/custom-pools-sdk";
import { ChevronLeft } from "lucide-react";
import { Address } from "viem";
import { MiddleView } from "../types";

interface NewPositionStepperSidebarProps {
    poolId?: string;
    token0Address?: string;
    token1Address?: string;
    chartMinPrice?: number;
    chartMaxPrice?: number;
    setMiddleView: (view: MiddleView) => void;
}

export default function NewPositionStepperSidebar({
    poolId,
    token0Address,
    token1Address,
    chartMinPrice,
    chartMaxPrice,
    setMiddleView,
}: NewPositionStepperSidebarProps) {
    const currencyA = useCurrency(token0Address as Address, true);
    const currencyB = useCurrency(token1Address as Address, true);
    const mintInfo = useDerivedMintInfo(currencyA, currencyB, poolId as Address, INITIAL_POOL_FEE, currencyA);
    const { independentField, typedValue } = useMintState();

    const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A;
    const dependentValue = mintInfo.parsedAmounts[dependentField]?.toSignificant(6) || "0";
    const hasAmountA = Number(mintInfo.parsedAmounts[Field.CURRENCY_A]?.toSignificant(24) || 0) > 0;
    const hasAmountB = Number(mintInfo.parsedAmounts[Field.CURRENCY_B]?.toSignificant(24) || 0) > 0;
    const isRangeStepComplete = typeof chartMinPrice === "number" && typeof chartMaxPrice === "number";
    const isAmountsStepComplete = (mintInfo.depositADisabled || hasAmountA) && (mintInfo.depositBDisabled || hasAmountB);
    const isOverviewStepComplete =
        isRangeStepComplete &&
        isAmountsStepComplete &&
        !mintInfo.errorMessage &&
        !mintInfo.invalidRange &&
        (Number(typedValue || 0) > 0 || Number(dependentValue || 0) > 0);

    const steps = [
        {
            title: "Select Range",
            description: "Pick min/max and preset.",
            complete: isRangeStepComplete,
        },
        {
            title: "Enter Amounts",
            description: "Set token deposit values.",
            complete: isAmountsStepComplete,
        },
        {
            title: "Overview",
            description: "Review and create position.",
            complete: isOverviewStepComplete,
        },
    ];

    return (
        <aside className="w-full overflow-hidden opacity-100 transition-all duration-200 lg:sticky lg:top-[88px] lg:w-[280px] lg:self-start">
            <div className="h-full">
                <div className="h-[220px] flex flex-col items-center p-3 lg:h-[calc(100%-44px)]">
                    <div className="w-full max-w-[220px]">
                        <div className="mb-3 text-left">
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 rounded-md px-2 text-xs text-foreground/80 hover:bg-white/5 hover:text-foreground"
                                onClick={() => setMiddleView("POOL_INFO")}
                            >
                                <ChevronLeft size={14} />
                                Back
                            </Button>
                        </div>
                        {steps.map((step, index) => (
                            <div key={step.title} className="flex flex-col">
                                <div className="flex items-start gap-3">
                                    <span
                                        className={cn(
                                            "mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                                            step.complete ? "bg-emerald-500/20 text-emerald-300" : "bg-card-dark text-foreground/60"
                                        )}
                                    >
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className={cn("text-sm font-semibold", step.complete ? "text-emerald-300" : "text-foreground/90")}>{step.title}</p>
                                        <p className="text-xs text-foreground/60">{step.description}</p>
                                    </div>
                                </div>
                                {index < steps.length - 1 ? (
                                    <div className={cn("ml-[11px] my-2 h-8 w-px", step.complete ? "bg-emerald-500/40" : "bg-card-border")} />
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
