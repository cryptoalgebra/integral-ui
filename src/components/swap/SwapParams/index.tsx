import Loader from "@/components/common/Loader";
import { usePoolPlugins } from "@/hooks/pools/usePoolPlugins";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import { useDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { SwapField } from "@/types/swap-field";
import { TradeState } from "@/types/trade-state";
import { computeRealizedLPFeePercent, warningSeverity } from "@/utils/swap/prices";
import { Currency, Percent, Trade, TradeType, unwrappedToken } from "@cryptoalgebra/integral-sdk";
import { ChevronDownIcon, ChevronRightIcon, ZapIcon } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

const SwapParams = () => {

    const { tradeState, toggledTrade: trade, allowedSlippage, poolAddress, currencies } = useDerivedSwapInfo();
    const { typedValue } = useSwapState()

    const { wrapType } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    const [isExpanded, toggleExpanded] = useState(false);

    const { dynamicFeePlugin } = usePoolPlugins(poolAddress)

    const adaptiveFee = useMemo(() => {

        if (!tradeState.fee) return;

        let p = 100;

        for (const fee of tradeState.fee) {
            p = p * (1 - Number(fee) / 1_000_000);
        }

        return 100 - p;
    }, [tradeState.fee]);

    const { realizedLPFee, priceImpact } = useMemo(() => {
        if (!trade) return { realizedLPFee: undefined, priceImpact: undefined };

        const realizedLpFeePercent = computeRealizedLPFeePercent(trade);
        const realizedLPFee = trade.inputAmount.multiply(realizedLpFeePercent);
        const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent);
        return { priceImpact, realizedLPFee };
    }, [trade]);

    const LPFeeString = realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${realizedLPFee.currency.symbol}` : "-";

    if (wrapType !== WrapType.NOT_APPLICABLE) return

    return trade ? (
        <div className="rounded text-white">
            <div className="flex justify-between">
                <button className="flex items-center w-full text-md mb-1 text-center text-white bg-card-dark py-1 px-3 rounded-lg" onClick={() => toggleExpanded(!isExpanded)}>
                    {adaptiveFee && (
                        <div className="rounded select-none pointer px-1.5 py-1 flex items-center relative">
                            {dynamicFeePlugin && <ZapIcon className="mr-2" strokeWidth={1} stroke="white" fill="white" size={16} />}
                            <span>
                                {`${adaptiveFee?.toFixed(3)}% fee`}
                            </span>
                        </div>
                    )}
                    <div className={`ml-auto duration-300 ${isExpanded && "rotate-180"}`}>
                        <ChevronDownIcon strokeWidth={2} size={16} />
                    </div>
                </button>
            </div>
            <div className={`h-0 duration-300 will-change-[height] overflow-hidden bg-card-dark rounded-xl ${isExpanded && "h-[180px]"}`}>
                <div className="flex flex-col gap-2.5 px-3 py-2 rounded-xl">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">Route</span>
                        <span>
                            <SwapRoute trade={trade} />
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">{trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sent'}</span>
                        <span>
                            {trade.tradeType === TradeType.EXACT_INPUT
                                ? `${trade.minimumAmountOut(allowedSlippage).toSignificant(6)} ${trade.outputAmount.currency.symbol}`
                                : `${trade.maximumAmountIn(allowedSlippage).toSignificant(6)} ${trade.inputAmount.currency.symbol}`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">LP Fee</span>
                        <span>{LPFeeString}</span>
                    </div>
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
    ) : trade !== undefined || tradeState.state === TradeState.LOADING ? (
        <div className="flex justify-center mb-1 bg-card-dark py-3 px-3 rounded-lg">
            <Loader size={17} />
        </div>
    ) : <div className="text-md mb-1 text-center text-white/70 bg-card-dark py-2 px-3 rounded-lg">
        Select an amount for swap
    </div>;
}

const SwapRoute = ({ trade }: { trade: Trade<Currency, Currency, TradeType> }) => {

    const path = trade.route.tokenPath;

    return <div className="flex items-center gap-1">
        {
            path.map((token, idx, path) => <Fragment key={`token-path-${idx}`}>
                <div>{unwrappedToken(token).symbol}</div>
                {idx === path.length - 1 ? null : <ChevronRightIcon size={16} />}
            </Fragment>)
        }
    </div>

}

const PriceImpact = ({ priceImpact }: { priceImpact: Percent | undefined }) => {

    const severity = warningSeverity(priceImpact)

    const color = severity === 3 || severity === 4 ? 'text-red-400' : severity === 2 ? 'text-yellow-400' : 'text-white'
    
    return <span className={color}>{priceImpact ? `${priceImpact.multiply(-1).toFixed(2)}%` : "-"}</span>

}

export default SwapParams