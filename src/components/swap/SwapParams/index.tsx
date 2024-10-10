import Loader from "@/components/common/Loader";
import { usePoolPlugins } from "@/hooks/pools/usePoolPlugins";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import { IDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { SwapField } from "@/types/swap-field";
import { warningSeverity } from "@/utils/swap/prices";
import { ADDRESS_ZERO, TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { ChevronDownIcon, ZapIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  SmartRouter,
  SmartRouterTrade,
  Percent as PercentBN,
} from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import SwapRouteModal from "@/components/modals/SwapRouteModal";
import { Button } from "@/components/ui/button.tsx";
import { getAlgebraBasePlugin, getAlgebraPool } from "@/generated";
import { ALGEBRA_ROUTER } from "@/constants/addresses";
import { MAX_UINT128 } from "@/constants/max-uint128";

const SwapParams = ({
  derivedSwap,
  smartTrade,
  isSmartTradeLoading,
}: {
  derivedSwap: IDerivedSwapInfo;
  smartTrade: SmartRouterTrade<TradeType>;
  isSmartTradeLoading: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [slidingFee, setSlidingFee] = useState<number>();

  const { allowedSlippage, currencies, poolAddress } = derivedSwap;
  const { typedValue } = useSwapState();

  const { wrapType } = useWrapCallback(
    currencies[SwapField.INPUT],
    currencies[SwapField.OUTPUT],
    typedValue
  );

  const [isExpanded, toggleExpanded] = useState(false);

  const { dynamicFeePlugin } = usePoolPlugins(poolAddress);

  useEffect(() => {

    if (!smartTrade) return undefined
    
    async function getFees () {

      const fees: number[] = []

      for (const route of smartTrade.routes) {

        const splits = [];
      
        for (let idx = 0; idx < Math.ceil(route.path.length / 2); idx++) {
          splits[idx] = [route.path[idx], route.path[idx + 1]];
        }
      
        for (let idx = 0; idx < route.pools.length; idx++) {
  
          const pool = route.pools[idx]
          const split = splits[idx]
          const amountIn = route.amountInList?.[idx] || 0n
          const amountOut = route.amountOutList?.[idx] || 0n

          if (pool.type !== 1) continue

          const isZeroToOne = split[0].wrapped.sortsBefore(split[1].wrapped)
  
          const poolContract = getAlgebraPool({
            address: pool.address
          })
  
          const plugin = await poolContract.read.plugin()

          const pluginContract = getAlgebraBasePlugin({
            address: plugin
          })

          let beforeSwap: [string, number, number]

          try {

            beforeSwap = await pluginContract.simulate.beforeSwap([
              ALGEBRA_ROUTER,
              ADDRESS_ZERO,
              isZeroToOne,
              smartTrade.tradeType === TradeType.EXACT_INPUT ? amountIn : amountOut,
              MAX_UINT128,
              false,
              '0x'
            ], { account: pool.address }).then(v => v.result as [string, number, number])

          } catch (error) {
            beforeSwap = ['', 0, 0]
          }

          const [, overrideFee, pluginFee] = beforeSwap || ['', 0, 0]
  
          if (overrideFee) {
            fees.push(overrideFee + pluginFee)
          } else {
            fees.push(pool.fee + pluginFee)
          }

          fees[fees.length - 1] = fees[fees.length - 1] * route.percent / 100

        }
  
      }

      let p = 100;

      for (const fee of fees) {
        p *= 1 - Number(fee) / 1_000_000;
      }
  
      setSlidingFee(100 - p)

    }

    getFees()

  }, [smartTrade])

  const priceImpact = useMemo(() => {
    if (!smartTrade) return undefined;
    return SmartRouter.getPriceImpact(smartTrade);
  }, [smartTrade]);

  const allowedSlippageBN = useMemo(() => {
    return new PercentBN(
      BigInt(allowedSlippage.numerator.toString()),
      BigInt(allowedSlippage.denominator.toString())
    );
  }, [allowedSlippage.denominator, allowedSlippage.numerator]);

  if (wrapType !== WrapType.NOT_APPLICABLE) return;

  return smartTrade ? (
    <div className="rounded text-white">
      <div className="flex justify-between">
        <button
          className="flex items-center w-full text-md mb-1 text-center text-white bg-card-dark py-1 px-3 rounded-lg"
          onClick={() => toggleExpanded(!isExpanded)}
        >
          {slidingFee ? (
            <div className="rounded select-none pointer px-1.5 py-1 flex items-center relative">
              {dynamicFeePlugin && (
                <ZapIcon
                  className="mr-2"
                  strokeWidth={1}
                  stroke="white"
                  fill="white"
                  size={16}
                />
              )}
              <span>{`${slidingFee?.toFixed(4)}% fee`}</span>
            </div>
          ) : <div className="rounded select-none px-1.5 py-1 flex items-center relative">
            <Loader size={16} />   
          </div>}
          <div className={`ml-auto duration-300 ${isExpanded && "rotate-180"}`}>
            <ChevronDownIcon strokeWidth={2} size={16} />
          </div>
        </button>
      </div>
      <div
        className={`h-0 duration-300 will-change-[height] overflow-hidden bg-card-dark rounded-xl ${
          isExpanded && "h-[180px]"
        }`}
      >
        <div className="flex flex-col gap-2.5 px-3 py-2 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Route</span>
            <span>
              <SwapRouteModal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                routes={smartTrade?.routes}
                tradeType={smartTrade?.tradeType}
              >
                <Button size={"sm"} onClick={() => setIsOpen(true)}>
                  Show
                </Button>
              </SwapRouteModal>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold">
              {smartTrade.tradeType === TradeType.EXACT_INPUT
                ? "Minimum received"
                : "Maximum sent"}
            </span>
            <span>
              {smartTrade.tradeType === TradeType.EXACT_INPUT
                ? `${SmartRouter.minimumAmountOut(
                    smartTrade,
                    allowedSlippageBN
                  ).toSignificant(6)} ${
                    smartTrade.outputAmount.currency.symbol
                  }`
                : `${SmartRouter.maximumAmountIn(
                    smartTrade,
                    allowedSlippageBN
                  ).toSignificant(6)} ${
                    smartTrade.inputAmount.currency.symbol
                  }`}
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
  ) : (
    <div className="text-md mb-1 text-center text-white/70 bg-card-dark py-2 px-3 rounded-lg">
      Select an amount for swap
    </div>
  );
};

const PriceImpact = ({
  priceImpact,
}: {
  priceImpact: PercentBN | undefined;
}) => {
  const severity = warningSeverity(priceImpact);

  const color =
    severity === 3 || severity === 4
      ? "text-red-400"
      : severity === 2
      ? "text-yellow-400"
      : "currentColor";

  return (
    <span className={color}>
      {priceImpact ? `${priceImpact.multiply(-1).toFixed(2)}%` : "-"}
    </span>
  );
};

export default SwapParams;
