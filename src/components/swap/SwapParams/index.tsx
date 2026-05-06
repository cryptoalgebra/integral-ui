import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import { useOverrideFee } from "@/hooks/swap/useOverrideFee";
import { IDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { useUserState } from "@/state/userStore";
import { SwapField } from "@/types/swap-field";
import { warningSeverity } from "@/utils/swap/prices";
import { BoostedRoute, Currency, Percent, Route as SDKRoute, TradeType } from "@cryptoalgebra/integral-sdk";
import { ArrowUpDown, ChevronDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Route as SmartRoute, SmartRouter } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { Button } from "@/components/ui/button.tsx";
import { TradeState } from "@/types/trade-state";
import { cn, formatAmount } from "@/utils";
import { SwapRouteModal } from "../SwapRouteModal";

const SwapParams = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
    const [isRateInverted, setIsRateInverted] = useState(false);

    const { allowedSlippage, currencies, toggledTrade: trade, tradeState, priceImpact: derivedPriceImpact } = derivedSwap;
    const { typedValue } = useSwapState();
    const { slippage } = useUserState();

    const { wrapType } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    const [isExpanded, toggleExpanded] = useState(false);

    const { fees } = useOverrideFee(trade);

    const isSmartTrade = trade && "routes" in trade;

    const priceImpact = useMemo(() => {
        if (!trade) return undefined;

        if (isSmartTrade) {
            return SmartRouter.getPriceImpact(trade);
        } else {
            return derivedPriceImpact ?? undefined;
        }
    }, [trade, isSmartTrade, derivedPriceImpact]);

    const minimumAmountOut = useMemo(() => {
        if (!trade) return undefined;

        if (isSmartTrade) {
            return trade.tradeType === TradeType.EXACT_INPUT
                ? `${SmartRouter.minimumAmountOut(trade, allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
                : `${SmartRouter.maximumAmountIn(trade, allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`;
        } else {
            return trade.tradeType === TradeType.EXACT_INPUT
                ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
                : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`;
        }
    }, [allowedSlippage, isSmartTrade, trade]);

    const displayRoutes = useMemo<SmartRoute[] | SDKRoute<Currency, Currency>[] | BoostedRoute<Currency, Currency>[] | undefined>(() => {
        if (!trade) return undefined;

        return isSmartTrade
            ? trade.routes
            : (trade.swaps.map((swap) => swap.route) as SDKRoute<Currency, Currency>[] | BoostedRoute<Currency, Currency>[]);
    }, [isSmartTrade, trade]);

    const rateDisplay = useMemo(() => {
        if (!trade) return "-";

        if (!isSmartTrade && "executionPrice" in trade) {
            const executionPrice = isRateInverted ? trade.executionPrice.invert() : trade.executionPrice;
            const priceValue = Number(executionPrice.toSignificant(12));

            if (!Number.isFinite(priceValue) || priceValue <= 0) {
                return "-";
            }

            return `1 ${executionPrice.baseCurrency.symbol} = ${formatAmount(priceValue, 8)} ${executionPrice.quoteCurrency.symbol}`;
        }

        const baseAmount = isRateInverted ? trade.outputAmount : trade.inputAmount;
        const quoteAmount = isRateInverted ? trade.inputAmount : trade.outputAmount;

        const inputAmount = Number(baseAmount.toSignificant(12));
        const outputAmount = Number(quoteAmount.toSignificant(12));

        if (!Number.isFinite(inputAmount) || !Number.isFinite(outputAmount) || inputAmount <= 0) {
            return "-";
        }

        const rate = outputAmount / inputAmount;

        return `1 ${baseAmount.currency.symbol} = ${formatAmount(rate, 8)} ${quoteAmount.currency.symbol}`;
    }, [isRateInverted, isSmartTrade, trade]);

    const summaryLabel = trade?.tradeType === TradeType.EXACT_INPUT ? "Minimum received" : "Maximum sent";

    const isTradeLoading = tradeState.state === TradeState.LOADING;

    if (wrapType !== WrapType.NOT_APPLICABLE) return;

    return trade || isTradeLoading ? (
        <div className="rounded-lg bg-card p-1 transition-all duration-300 ease-out animate-in fade-in-0 slide-in-from-bottom-2">
            <div className="flex items-center justify-between gap-4 p-3 text-sm">
                <span className="text-text-muted">{summaryLabel}</span>
                <span className="text-right font-medium text-text">{trade ? minimumAmountOut : "-"}</span>
            </div>

            <button
                type="button"
                className="mx-auto flex items-center gap-1 rounded-full px-3 py-1 text-sm text-text-muted transition-all duration-200 hover:bg-panel hover:text-text"
                onClick={() => toggleExpanded(!isExpanded)}
            >
                <span>{isExpanded ? "Less details" : "More details"}</span>
                <ChevronDownIcon className={cn("duration-200", isExpanded && "rotate-180")} size={16} strokeWidth={2} />
            </button>

            <div
                className={cn(
                    " grid overflow-hidden transition-all duration-300 ease-out",
                    isExpanded ? "opacity-100 h-[165px]" : " opacity-0 h-0",
                )}
            >
                <div className="overflow-hidden px-2 pb-2 pt-4">
                    <div className="border-t border-border pt-4 text-sm text-text">
                        <ParamsRow
                            label="Rate"
                            value={
                                <div className="flex items-center justify-end gap-2 text-right">
                                    <span>{rateDisplay}</span>
                                    <Button
                                        type="button"
                                        size={"sm"}
                                        variant={"ghost"}
                                        className="h-6 w-6 rounded-full p-0 text-text-muted hover:bg-panel hover:text-text"
                                        onClick={() => setIsRateInverted((prevState) => !prevState)}
                                    >
                                        <ArrowUpDown size={14} />
                                    </Button>
                                </div>
                            }
                        />
                        <ParamsRow
                            label="Slippage Tolerance"
                            value={
                                <div className="flex items-center gap-2 text-right">
                                    {slippage === "auto" && (
                                        <span className="rounded-full bg-panel px-2.5 py-0.5 text-xs font-medium text-text-muted">
                                            Auto
                                        </span>
                                    )}
                                    <span>{allowedSlippage.toFixed(2).replace(/\.00$/, "")}%</span>
                                </div>
                            }
                        />
                        <ParamsRow label="Price Impact" value={<PriceImpact priceImpact={priceImpact} />} />
                        <ParamsRow
                            label="Route"
                            value={
                                trade && displayRoutes ? (
                                    <div className="flex items-center justify-end gap-2 text-right">
                                        <SwapRouteModal
                                            isOpen={isRouteModalOpen}
                                            setIsOpen={setIsRouteModalOpen}
                                            routes={displayRoutes}
                                            fees={fees}
                                            tradeType={trade.tradeType}
                                        >
                                            <Button
                                                type="button"
                                                size={"sm"}
                                                variant={"outline"}
                                                className="h-6 px-2 text-xs hover:bg-panel"
                                            >
                                                View
                                            </Button>
                                        </SwapRouteModal>
                                    </div>
                                ) : (
                                    "-"
                                )
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    ) : null;
    // <div className="rounded-[24px] bg-card p-3 text-center text-sm text-text-muted">Enter an amount to preview route and slippage</div>
};

const ParamsRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4 py-1.5 first:pt-0 last:pb-1 text-sm">
        <span className="text-text-muted">{label}</span>
        <div className="font-medium text-text">{value}</div>
    </div>
);

const PriceImpact = ({ priceImpact }: { priceImpact: Percent | undefined }) => {
    const severity = warningSeverity(priceImpact);

    const color = severity >= 3 ? "text-accent" : priceImpact ? "text-primary" : "text-text";

    return <span className={color}>{priceImpact ? `${priceImpact.multiply(-1).toFixed(2)}%` : "-"}</span>;
};

export default SwapParams;
