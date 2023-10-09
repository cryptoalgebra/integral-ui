import { useDerivedSwapInfo } from "@/state/swapStore";
import { TradeType } from "@cryptoalgebra/integral-sdk";
import { ChevronDownIcon, InfoIcon, ZapIcon } from "lucide-react";
import { useMemo, useState } from "react";

const SwapParams = () => {

    const { tradeState, toggledTrade: trade, allowedSlippage } = useDerivedSwapInfo();

    const [isExpanded, toggleExpanded] = useState(false);

    const adaptiveFee = useMemo(() => {
        if (!tradeState.fees) return;

        let p = 100;

        for (const fee of tradeState.fees) {
            p = p * (1 - fee / 1_000_000);
        }

        return 100 - p;
    }, [tradeState.fees]);

    // const { realizedLPFee, priceImpact } = useMemo(() => {
    //     if (!trade) return { realizedLPFee: undefined, priceImpact: undefined };

    //     const realizedLpFeePercent = computeRealizedLPFeePercent(trade);
    //     const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent);
    //     const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent);
    //     return { priceImpact, realizedLPFee };
    // }, [trade]);

    // const LPFeeString = realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${realizedLPFee.currency.symbol}` : "-";

    return trade ? (
        <div className="rounded text-white">
            <div className="flex justify-between">
                {adaptiveFee && (
                    <div className="rounded select-none pointer px-1.5 py-1 flex items-center relative">
                        <ZapIcon className="mr-2" strokeWidth={1} fill="white" size={16} />
                        <span>
                                {`${adaptiveFee?.toFixed(3)}% fee`}
                        </span>
                    </div>
                )}
                <button className="rounded select-none px-1.5 py-1 flex items-center hover:bg-dark-card-hover" onClick={() => toggleExpanded(!isExpanded)}>
                    <InfoIcon className="mr-2" strokeWidth={2} size={16} />
                    <span className="mr-2">
                        Swap details
                    </span>
                    <div className={`swap-params__details-chevron duration-[0.3s] ${isExpanded && "rotate-180"}`}>
                        <ChevronDownIcon strokeWidth={2} size={16} />
                    </div>
                </button>
            </div>
            <div className={`h-0 duration-[0.3s] will-change-[height] overflow-hidden ${isExpanded && "h-[155px]"}`}>
                <div className="pt-4 px-2">
                    <div className="flex items-center justify-between mb-2.5">
                        <span>Route</span>
                        <span>
                            {/* <SwapRoute trade={trade} /> */}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mb-2.5">
                        <span>{trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sent'}</span>
                        <span>
                            {trade.tradeType === TradeType.EXACT_INPUT
                                ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
                                : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mb-2.5">
                        <span>Liquidity Provider Fee</span>
                        {/* <span>{LPFeeString}</span> */}
                    </div>
                    <div className="flex items-center justify-between mb-2.5">
                        <span>Price impact</span>
                        <span>
                            {/* <FormattedPriceImpact priceImpact={priceImpact} /> */}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mb-2.5">
                        <span>Slippage tolerance</span>
                        <span>{allowedSlippage.toFixed(2)}%</span>
                    </div>
                </div>
            </div>
        </div>
    ) : trade !== undefined ? (
        <div className="rounded text-white">
            {/* <Loader stroke="white" /> */}
            <span className="ml-2">
                    Loading
            </span>
        </div>
    ) : <div className="text-left text-white">
            Select amount for swap
    </div>;

}

export default SwapParams