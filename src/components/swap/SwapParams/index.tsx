import { useDerivedSwapInfo } from "@/state/swapStore";
import { TradeType } from "@cryptoalgebra/integral-sdk";
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
        <div className="py-2 px-2 bg-dark-card rounded text-white">
            <div className="flex justify-between">
                {adaptiveFee && (
                    <div className="rounded select-none pointer px-1.5 py-1 flex items-center relative">
                        {/* <Zap className="mr-2" strokeWidth={1} fill="white" size={16} /> */}
                        <span>
                            <h5>
                                {`${adaptiveFee?.toFixed(3)}% fee`}
                            </h5>
                        </span>
                    </div>
                )}
                <button className="rounded select-none px-1.5 py-1 flex items-center hover:bg-dark-card-hover" onClick={() => toggleExpanded(!isExpanded)}>
                    {/* <Info className="mr-2" strokeWidth={2} size={16} /> */}
                    <span className="mr-2">
                        <h5>Swap details</h5>
                    </span>
                    <div className={`swap-params__details-chevron duration-[0.3s] ${isExpanded && "rotate-180"}`}>
                        {/* <ChevronDown strokeWidth={2} size={16} /> */}
                    </div>
                </button>
            </div>
            <div className={`h-0 duration-[0.3s] will-change-[height] overflow-hidden ${isExpanded && "h-[155px]"}`}>
                <div className="pt-4 px-2">
                    <div className="flex items-center justify-between mb-2.5">
                        <h5>Route</h5>
                        <span>
                            {/* <SwapRoute trade={trade} /> */}
                        </span>
                    </div>
                    <div className="flex items-center justify-between mb-2.5">
                        <h5>{trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sent'}</h5>
                        <h5>
                            {trade.tradeType === TradeType.EXACT_INPUT
                                ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
                                : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`}
                        </h5>
                    </div>
                    <div className="flex items-center justify-between mb-2.5">
                        <h5>Liquidity Provider Fee</h5>
                        {/* <h5>{LPFeeString}</h5> */}
                    </div>
                    <div className="flex items-center justify-between mb-2.5">
                        <h5>Price impact</h5>
                        <h5>
                            {/* <FormattedPriceImpact priceImpact={priceImpact} /> */}
                        </h5>
                    </div>
                    <div className="flex items-center justify-between mb-2.5">
                        <h5>Slippage tolerance</h5>
                        <h5>{allowedSlippage.toFixed(2)}%</h5>
                    </div>
                </div>
            </div>
        </div>
    ) : trade !== undefined ? (
        <div className="py-2 px-2 bg-dark-card rounded text-white">
            {/* <Loader stroke="white" /> */}
            <span className="ml-2">
                <h5>
                    Loading
                </h5>
            </span>
        </div>
    ) : <div className="py-3 px-4 bg-dark-card rounded text-white">
        <h5>
            Select amount for swap
        </h5>
    </div>;

}

export default SwapParams