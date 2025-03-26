import { ALGEBRA_ROUTER } from "@/constants/addresses";
import { MAX_UINT128 } from "@/constants/max-uint128";
import { getAlgebraBasePlugin, getAlgebraPool } from "@/generated";
import { ADDRESS_ZERO, TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { SmartRouterTrade } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { useEffect, useState } from "react";

export function useOverrideFee(smartTrade: SmartRouterTrade<TradeType>) {
    const [overrideFees, setOverrideFees] = useState<{
        fee: number | undefined;
        fees: number[][];
    }>({ fee: undefined, fees: [] });

    useEffect(() => {
        if (!smartTrade) return undefined;

        async function getFees() {
            const fees: number[][] = [];

            for (const route of smartTrade.routes) {
                const splits = [];
                const splitFees = [];

                for (let idx = 0; idx <= Math.ceil(route.path.length / 2); idx++) {
                    splits[idx] = [route.path[idx], route.path[idx + 1]];
                }

                for (let idx = 0; idx < route.pools.length; idx++) {
                    const pool = route.pools[idx];
                    const split = splits[idx];
                    const amountIn = route.amountInList?.[idx] || 0n;
                    const amountOut = route.amountOutList?.[idx] || 0n;

                    if (pool.type !== 1) continue;

                    const isZeroToOne = split[0].wrapped.sortsBefore(split[1].wrapped);

                    const poolContract = getAlgebraPool({
                        address: pool.address,
                    });

                    const plugin = await poolContract.read.plugin();

                    const pluginContract = getAlgebraBasePlugin({
                        address: plugin,
                    });

                    let beforeSwap: [string, number, number];

                    try {
                        beforeSwap = await pluginContract.simulate
                            .beforeSwap(
                                [
                                    ALGEBRA_ROUTER,
                                    ADDRESS_ZERO,
                                    isZeroToOne,
                                    smartTrade.tradeType === TradeType.EXACT_INPUT ? amountIn : amountOut,
                                    MAX_UINT128,
                                    false,
                                    "0x",
                                ],
                                { account: pool.address }
                            )
                            .then((v) => v.result as [string, number, number]);
                    } catch (error) {
                        beforeSwap = ["", 0, 0];
                    }

                    const [, overrideFee, pluginFee] = beforeSwap || ["", 0, 0];

                    if (overrideFee) {
                        splitFees.push(overrideFee + pluginFee);
                    } else {
                        splitFees.push(Number(route.feeList?.[idx] || 0) + pluginFee);
                    }

                    splitFees[splitFees.length - 1] = (splitFees[splitFees.length - 1] * route.percent) / 100;

                    fees.push(splitFees);
                }
            }

            let p = 100;

            for (const fee of fees.flat()) {
                p *= 1 - Number(fee) / 1_000_000;
            }

            setOverrideFees({
                fee: 100 - p,
                fees,
            });
        }

        getFees();
    }, [smartTrade]);

    return overrideFees;
}
