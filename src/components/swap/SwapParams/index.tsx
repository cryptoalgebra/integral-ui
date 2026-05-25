import Loader from "@/components/common/Loader";
import { usePoolPlugins } from "@/hooks/pools/usePoolPlugins";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import { IDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { SwapField } from "@/types/swap-field";
import { warningSeverity } from "@/utils/swap/prices";
import { Percent, TradeType } from "@cryptoalgebra/integral-sdk";
import { ChevronDownIcon, InfoIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { SmartRouter } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { useOverrideFee } from "@/hooks/swap/useOverrideFee";
import { TradeState } from "@/types/trade-state";
import { cn } from "@/utils";
import { SwapRouteModal } from "../SwapRouteModal";
import { Skeleton } from "@/components/ui/skeleton";

const SwapParams = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const [isOpen, setIsOpen] = useState(false);

    const { allowedSlippage, currencies, poolAddress, toggledTrade: trade, tradeState, priceImpact: derivedPriceImpact } = derivedSwap;
    const { typedValue } = useSwapState();

    const { wrapType } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    const [isExpanded, toggleExpanded] = useState(false);

    const { dynamicFeePlugin } = usePoolPlugins(poolAddress);

    const { fee, fees } = useOverrideFee(trade);

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

    const isTradeLoading = tradeState.state === TradeState.LOADING;

    if (wrapType !== WrapType.NOT_APPLICABLE) return;

    if (!trade && !isTradeLoading) return null;

    return (
        <div>
            <button
                className="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-xl bg-card-light hover:bg-card-light/80 transition-all duration-200"
                onClick={() => toggleExpanded(!isExpanded)}
            >
                {trade !== undefined && isTradeLoading ? (
                    <Skeleton className="w-full h-5 rounded-xl" />
                ) : (
                    <>
                        <div className="flex items-center gap-2 text-text-300">
                            <InfoIcon size={14} />
                            <span>
                                {fee !== undefined ? (
                                    <span className="text-text-200">
                                        {dynamicFeePlugin && "Dynamic "}
                                        Fee: <span className="text-white font-medium">{fee?.toFixed(2)}%</span>
                                    </span>
                                ) : (
                                    <Loader size={14} />
                                )}
                            </span>
                        </div>
                        <ChevronDownIcon
                            size={16}
                            className={cn("text-text-300 transition-transform duration-200", isExpanded && "rotate-180")}
                        />
                    </>
                )}
            </button>

            {trade && !isTradeLoading && (
                <div
                    className={cn(
                        "overflow-hidden transition-all duration-300 ease-out",
                        isExpanded ? "max-h-48 opacity-100" : "max-h-0 opacity-0",
                    )}
                >
                    <div className="flex flex-col gap-2 px-3 py-2 mt-1 rounded-xl bg-bg-100/30">
                        <SwapDetailRow
                            label="Route"
                            value={
                                <SwapRouteModal
                                    isOpen={isOpen}
                                    setIsOpen={setIsOpen}
                                    routes={isSmartTrade ? trade?.routes : trade.swaps.map((swap) => swap.route)}
                                    fees={fees}
                                    tradeType={trade?.tradeType}
                                >
                                    <button
                                        onClick={() => setIsOpen(true)}
                                        className="text-primary-100 hover:text-primary-200 text-sm font-medium transition-colors"
                                    >
                                        View
                                    </button>
                                </SwapRouteModal>
                            }
                        />
                        <SwapDetailRow
                            label={trade.tradeType === TradeType.EXACT_INPUT ? "Min. received" : "Max. sent"}
                            value={<span className="text-white">{minimumAmountOut}</span>}
                        />
                        <SwapDetailRow label="Price impact" value={<PriceImpact priceImpact={priceImpact} />} />
                        <SwapDetailRow label="Slippage" value={<span className="text-white">{allowedSlippage.toFixed(2)}%</span>} />
                    </div>
                </div>
            )}
        </div>
    );
};

const SwapDetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between text-sm">
        <span className="text-text-300">{label}</span>
        {value}
    </div>
);

const PriceImpact = ({ priceImpact }: { priceImpact: Percent | undefined }) => {
    const severity = warningSeverity(priceImpact);

    const color = severity >= 3 ? "text-red-400" : priceImpact ? "text-orange-400" : "text-text";

    return <span className={color}>{priceImpact ? `${priceImpact.multiply(-1).toFixed(2)}%` : "-"}</span>;
};

export default SwapParams;
