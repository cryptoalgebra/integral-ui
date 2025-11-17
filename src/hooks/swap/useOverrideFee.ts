import { SWAP_ROUTER } from "config";
import { readAlgebraPoolPlugin, simulateAlgebraBasePluginV1BeforeSwap } from "@/generated";
import { wagmiConfig } from "@/providers/WagmiProvider";
import { ADDRESS_ZERO, computePoolAddress, Currency, Trade, TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { SmartRouterTrade } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { useEffect, useState } from "react";
import { useChainId } from "wagmi";
import { Address, maxUint128 } from "viem";

export function useOverrideFee(trade: SmartRouterTrade<TradeType> | Trade<Currency, Currency, TradeType> | null | undefined) {
    const [overrideFees, setOverrideFees] = useState<{
        fee: number | undefined;
        fees: number[][];
    }>({ fee: undefined, fees: [] });

    const chainId = useChainId();

    useEffect(() => {
        if (!trade) return undefined;
        const isSmartTrade = trade && "routes" in trade;

        const getFees = async () => {
            const fees: number[][] = [];

            if (isSmartTrade) {
                for (const route of trade.routes) {
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

                        const plugin = await readAlgebraPoolPlugin(wagmiConfig, {
                            address: pool.address,
                        });

                        let beforeSwap: [string, number, number];

                        try {
                            const { result } = await simulateAlgebraBasePluginV1BeforeSwap(wagmiConfig, {
                                address: plugin,
                                args: [
                                    SWAP_ROUTER[chainId],
                                    ADDRESS_ZERO,
                                    isZeroToOne,
                                    trade.tradeType === TradeType.EXACT_INPUT ? amountIn : amountOut,
                                    maxUint128,
                                    false,
                                    "0x",
                                ] as const,
                                account: pool.address,
                            });

                            beforeSwap = result as [string, number, number];
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
            } else {
                for (const route of trade.swaps) {
                    const splitFees = [];

                    const isBoostedRoute = route.route.isBoosted;

                    if (isBoostedRoute && route.route.pools.length === 0) {
                        continue;
                    }

                    for (let idx = 0; idx < route.route.pools.length; idx++) {
                        const pool = route.route.pools[idx];

                        const poolAddress = computePoolAddress({
                            tokenA: pool.token0.wrapped,
                            tokenB: pool.token1.wrapped,
                        }) as Address;

                        const isZeroToOne = route.inputAmount.currency.wrapped.sortsBefore(route.outputAmount.currency.wrapped);

                        const amountIn = BigInt(route.inputAmount.quotient.toString());
                        const amountOut = BigInt(route.outputAmount.quotient.toString());

                        const plugin = await readAlgebraPoolPlugin(wagmiConfig, {
                            address: poolAddress,
                        });

                        let beforeSwap: [string, number, number];

                        try {
                            const { result } = await simulateAlgebraBasePluginV1BeforeSwap(wagmiConfig, {
                                address: plugin,
                                args: [
                                    SWAP_ROUTER[chainId],
                                    ADDRESS_ZERO,
                                    isZeroToOne,
                                    trade.tradeType === TradeType.EXACT_INPUT ? amountIn : amountOut,
                                    maxUint128,
                                    false,
                                    "0x",
                                ] as const,
                                account: poolAddress,
                            });

                            beforeSwap = result as [string, number, number];
                        } catch (error) {
                            beforeSwap = ["", 0, 0];
                        }

                        const [, overrideFee, pluginFee] = beforeSwap || ["", 0, 0];

                        if (overrideFee) {
                            splitFees.push(overrideFee + pluginFee);
                        } else {
                            splitFees.push(pluginFee);
                        }
                    }

                    if (splitFees.length > 0) {
                        fees.push(splitFees);
                    }
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
        };

        getFees();
    }, [trade, chainId]);

    return overrideFees;
}
