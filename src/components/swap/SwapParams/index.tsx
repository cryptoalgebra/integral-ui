import Loader from "@/components/common/Loader";
import { usePoolPlugins } from "@/hooks/pools/usePoolPlugins";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import {IDerivedSwapInfo, useSwapState} from "@/state/swapStore";
import { SwapField } from "@/types/swap-field";
import { warningSeverity } from "@/utils/swap/prices";
import { TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { ChevronDownIcon, ZapIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { SmartRouter, SmartRouterTrade, Percent as PercentBN } from "@cryptoalgebra/router-custom-pools";
import SwapRouteModal from "@/components/modals/SwapRouteModal";
import {Button} from "@/components/ui/button.tsx";

const SwapParams = ({ derivedSwap, smartTrade, isSmartTradeLoading }: { derivedSwap: IDerivedSwapInfo, smartTrade: SmartRouterTrade<TradeType>, isSmartTradeLoading: boolean }) => {

    const [isOpen, setIsOpen] = useState(false)

    const { allowedSlippage, currencies, poolAddress } = derivedSwap;
    const { typedValue } = useSwapState()

    const { wrapType } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    const [isExpanded, toggleExpanded] = useState(false);

    const { dynamicFeePlugin } = usePoolPlugins(poolAddress)

    const combinedFee = useMemo(() => {
        if (!smartTrade) return undefined;

        const fees = smartTrade.routes.flatMap((routes: any) =>
            routes.pools.flatMap((pool: any) => pool.fee,
            ),
        );

        let p = 100;

        for (const fee of fees) {
            p *= 1 - Number(fee) / 1_000_000;
        }

        return 100 - p;
    }, [smartTrade]);

    const priceImpact = useMemo(() => {
        if (!smartTrade) return undefined;
        return SmartRouter.getPriceImpact(smartTrade);
    }, [smartTrade]);

    const allowedSlippageBN = useMemo(() => {
        return new PercentBN(BigInt(allowedSlippage.numerator.toString()), BigInt(allowedSlippage.denominator.toString()));
    }, [allowedSlippage.denominator, allowedSlippage.numerator]);

    if (wrapType !== WrapType.NOT_APPLICABLE) return

    return smartTrade ? (
        <div className="rounded text-white">
            <div className="flex justify-between">
                <button className="flex items-center w-full text-md mb-1 text-center text-white bg-card-dark py-1 px-3 rounded-lg" onClick={() => toggleExpanded(!isExpanded)}>
                    {combinedFee && (
                        <div className="rounded select-none pointer px-1.5 py-1 flex items-center relative">
                            {dynamicFeePlugin && <ZapIcon className="mr-2" strokeWidth={1} stroke="white" fill="white" size={16} />}
                            <span>
                                {`${combinedFee?.toFixed(3)}% fee`}
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
                            <SwapRouteModal isOpen={isOpen} setIsOpen={setIsOpen} routes={smartTrade?.routes}>
                                <Button size={'sm'} onClick={() => setIsOpen(true)}>Show</Button>
                            </SwapRouteModal>
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="font-semibold">{smartTrade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sent'}</span>
                        <span>
                            {smartTrade.tradeType === TradeType.EXACT_INPUT
                                ? `${SmartRouter.minimumAmountOut(smartTrade, allowedSlippageBN).toSignificant(6)} ${smartTrade.outputAmount.currency.symbol}`
                                : `${SmartRouter.maximumAmountIn(smartTrade, allowedSlippageBN).toSignificant(6)} ${smartTrade.inputAmount.currency.symbol}`}
                        </span>
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
    ) : smartTrade !== undefined && isSmartTradeLoading ? (
        <div className="flex justify-center mb-1 bg-card-dark py-3 px-3 rounded-lg">
            <Loader size={17} />
        </div>
    ) : <div className="text-md mb-1 text-center text-white/70 bg-card-dark py-2 px-3 rounded-lg">
        Select an amount for swap
    </div>;
}

const PriceImpact = ({ priceImpact }: { priceImpact: PercentBN | undefined }) => {
    const severity = warningSeverity(priceImpact);

    const color = severity === 3 || severity === 4 ? 'text-red-400' : severity === 2 ? 'text-yellow-400' : 'currentColor';

    return (
        <span className={color}>
            {priceImpact ? `${priceImpact.multiply(-1).toFixed(2)}%` : '-'}
        </span>
    );
};

export default SwapParams
