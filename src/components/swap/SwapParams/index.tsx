import Loader from "@/components/common/Loader";
import { usePoolPlugins } from "@/hooks/pools/usePoolPlugins";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import { IDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { SwapField } from "@/types/swap-field";
import { warningSeverity } from "@/utils/swap/prices";
import { Percent, TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { ChevronDownIcon, ZapIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { SmartRouter } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { Button } from "@/components/ui/button.tsx";
import { useOverrideFee } from "@/hooks/swap/useOverrideFee";
import { TradeState } from "@/types/trade-state";
import { cn } from "@/utils";
import { SwapRouteModal } from "../SwapRouteModal";

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

    return trade ? (
        <div className="rounded">
            <div className="flex justify-between">
                <button
                    className="flex items-center w-full text-md mb-1 text-center bg-card-dark border border-card-border py-1 px-3 rounded-lg"
                    onClick={() => toggleExpanded(!isExpanded)}
                >
                    {fee !== undefined ? (
                        <div className="rounded select-none pointer px-1.5 py-1 flex items-center relative">
                            {dynamicFeePlugin && <ZapIcon className="mr-2 fill-text" strokeWidth={1} stroke="white" size={16} />}
                            <span>{`${fee?.toFixed(4)}% fee`}</span>
                        </div>
                    ) : (
                        <div className="rounded select-none px-1.5 py-1 flex items-center relative">
                            <Loader size={16} />
                        </div>
                    )}
                    <div className={`ml-auto duration-300 ${isExpanded && "rotate-180"}`}>
                        <ChevronDownIcon strokeWidth={2} size={16} />
                    </div>
                </button>
            </div>
            <div
                className={cn(
                    "h-0 duration-300 will-change-[height] overflow-hidden bg-card-dark rounded-lg",
                    isExpanded && "h-[160px]",
                    isExpanded && "border border-card-border"
                )}
            >
                <div className="flex flex-col gap-2.5 px-3 py-2 rounded-xl">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Route</span>
                        <span>
                            <SwapRouteModal
                                isOpen={isOpen}
                                setIsOpen={setIsOpen}
                                routes={isSmartTrade ? trade?.routes : trade.swaps.map((swap) => swap.route)}
                                fees={fees}
                                tradeType={trade?.tradeType}
                            >
                                <Button size={"sm"} variant={"outline"} onClick={() => setIsOpen(true)}>
                                    Show
                                </Button>
                            </SwapRouteModal>
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="font-semibold">
                            {trade.tradeType === TradeType.EXACT_INPUT ? "Minimum received" : "Maximum sent"}
                        </span>
                        <span>{minimumAmountOut}</span>
                    </div>
                    {/*<div className="flex items-center justify-between">*/}
                    {/*    <span className="font-semibold">LP Fee</span>*/}
                    {/*    <span>{LPFeeString}</span>*/}
                    {/*</div>*/}
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Price impact</span>
                        <span>
                            <PriceImpact priceImpact={priceImpact} />
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Slippage tolerance</span>
                        <span>{allowedSlippage.toFixed(2)}%</span>
                    </div>
                </div>
            </div>
        </div>
    ) : trade !== undefined && isTradeLoading ? (
        <div className="flex justify-center mb-1 bg-card-dark border border-card-border py-3 px-3 rounded-lg">
            <Loader size={17} className="text-text" />
        </div>
    ) : (
        <div className="text-md mb-1 text-center opacity-70 bg-card-dark border border-card-border py-2 px-3 rounded-lg">
            Select an amount for swap
        </div>
    );
};

const PriceImpact = ({ priceImpact }: { priceImpact: Percent | undefined }) => {
    const severity = warningSeverity(priceImpact);

    const color = severity === 3 || severity === 4 ? "text-red-400" : severity === 2 ? "text-yellow-400" : "currentColor";

    return <span className={color}>{priceImpact ? `${priceImpact.multiply(-1).toFixed(2)}%` : "-"}</span>;
};

export default SwapParams;
