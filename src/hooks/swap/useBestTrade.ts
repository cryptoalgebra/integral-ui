import { Currency, CurrencyAmount, Percent, Route, TradeType, Trade, BoostedRoute } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { TradeState, TradeStateType } from "@/types/trade-state";
import { useAllRoutes } from "./useAllRoutes";
import { useQuotesResults } from "./useQuotesResults";
import { RouterType, useSwapState } from "@/state/swapStore";

import BoostedPoolsModule from "@/modules/BoostedPoolsModule";
import { calculatePriceImpact } from "@/utils/swap/calculatePriceImpact";
const { useBoostedQuotesResults } = BoostedPoolsModule.hooks;

// const DEFAULT_GAS_QUOTE = 2_000_000

export interface BestTradeExactIn {
    state: TradeStateType;
    trade: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null;
    fee?: number[] | null;
    priceAfterSwap?: bigint[] | null;
    priceImpact?: Percent | null;
    /** Step amounts out - output amount for each step (for Boosted ExactOutput) */
    stepAmountsOut?: string[] | null;
}

export interface BestTradeExactOut {
    state: TradeStateType;
    trade: Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null;
    fee?: number[] | null;
    priceAfterSwap?: bigint[] | null;
    priceImpact?: Percent | null;
    /** Step amounts out - output amount for each step (for Boosted ExactOutput) */
    stepAmountsOut?: string[] | null;
}

/**
 * Returns the best v3 trade for a desired exact input swap
 * @param amountIn the amount to swap in
 * @param currencyOut the desired output currency
 */
export function useBestTradeExactIn(amountIn?: CurrencyAmount<Currency>, currencyOut?: Currency): BestTradeExactIn {
    const { routerType } = useSwapState();
    const { boostedRoutes, normalRoutes, loading: routesLoading } = useAllRoutes(amountIn?.currency, currencyOut, true);

    const { data: boostedQuotesResults, isLoading: isBoostedQuotesLoading, refetch: refetchBoosted } = useBoostedQuotesResults({
        exactInput: true,
        amountIn,
        currencyOut,
    });

    const { data: normalQuotesResults, isLoading: isNormalQuotesLoading, refetch: refetchNormal } = useQuotesResults({
        exactInput: true,
        amountIn,
        currencyOut,
    });

    const trade = useMemo(() => {
        if (!amountIn || !currencyOut) {
            return {
                state: TradeState.INVALID,
                trade: null,
                refetch: () => {
                    refetchBoosted();
                    refetchNormal();
                },
            };
        }

        if (routesLoading || isBoostedQuotesLoading || isNormalQuotesLoading) {
            return {
                state: TradeState.LOADING,
                trade: null,
            };
        }

        // Omega Router: use all routes (boosted + normal)
        // Native Router: use only normal routes (doesn't support boosted)
        const activeRoutes = routerType === RouterType.OMEGA ? [...boostedRoutes, ...normalRoutes] : normalRoutes;
        const activeQuotesResults =
            routerType === RouterType.OMEGA ? [...(boostedQuotesResults || []), ...(normalQuotesResults || [])] : normalQuotesResults || [];

        type BestRouteResult = {
            bestRoute: Route<Currency, Currency> | BoostedRoute<Currency, Currency> | null;
            amountOut: bigint | null;
            fee: number[] | null;
            priceAfterSwap: bigint[] | null;
        };

        const { bestRoute, amountOut, fee, priceAfterSwap } = activeQuotesResults.reduce<BestRouteResult>(
            (currentBest, result, i) => {
                if (!result) return currentBest;

                const resultAmountOut = result[0][result[0].length - 1];

                if (currentBest.amountOut === null) {
                    return {
                        bestRoute: activeRoutes[i] as Route<Currency, Currency> | BoostedRoute<Currency, Currency>,
                        amountOut: resultAmountOut,
                        fee: result[5],
                        priceAfterSwap: result[2],
                        stepAmountsOut: null,
                    };
                } else if (currentBest.amountOut < resultAmountOut) {
                    return {
                        bestRoute: activeRoutes[i] as Route<Currency, Currency> | BoostedRoute<Currency, Currency>,
                        amountOut: resultAmountOut,
                        fee: result[5],
                        priceAfterSwap: result[2],
                        stepAmountsOut: null,
                    };
                }

                return currentBest;
            },
            {
                bestRoute: null,
                amountOut: null,
                fee: null,
                priceAfterSwap: null,
            }
        );

        if (!bestRoute || !amountOut) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
                fee: null,
                priceAfterSwap: null,
                priceImpact: null,
                stepAmountsOut: null,
            };
        }

        const priceImpact = priceAfterSwap ? calculatePriceImpact(bestRoute, priceAfterSwap) : null;

        return {
            state: TradeState.VALID,
            fee,
            trade: Trade.createUncheckedTrade({
                route: bestRoute,
                tradeType: TradeType.EXACT_INPUT,
                inputAmount: amountIn,
                outputAmount: CurrencyAmount.fromRawAmount(currencyOut, amountOut.toString()),
            }),
            priceAfterSwap,
            priceImpact,
            stepAmountsOut: null,
            refetch: () => {
                refetchBoosted();
                refetchNormal();
            },
        };
    }, [
        amountIn,
        currencyOut,
        boostedQuotesResults,
        normalQuotesResults,
        boostedRoutes,
        normalRoutes,
        routesLoading,
        isBoostedQuotesLoading,
        isNormalQuotesLoading,
        refetchBoosted,
        refetchNormal,
        routerType,
    ]);

    return trade;
}

/**
 * Returns the best v3 trade for a desired exact output swap
 * @param currencyIn the desired input currency
 * @param amountOut the amount to swap out
 */
export function useBestTradeExactOut(currencyIn?: Currency, amountOut?: CurrencyAmount<Currency>): BestTradeExactOut {
    const { routerType } = useSwapState();
    const { boostedRoutes, normalRoutes, loading: routesLoading } = useAllRoutes(currencyIn, amountOut?.currency, false);

    const { data: boostedQuotesResults, isLoading: isBoostedQuotesLoading, refetch: refetchBoosted } = useBoostedQuotesResults({
        exactInput: false,
        currencyIn,
        amountOut,
    });

    const { data: normalQuotesResults, isLoading: isNormalQuotesLoading, refetch: refetchNormal } = useQuotesResults({
        exactInput: false,
        currencyIn,
        amountOut,
    });

    const trade = useMemo(() => {
        if (!amountOut || !currencyIn) {
            return {
                state: TradeState.INVALID,
                trade: null,
                refetch: () => {
                    refetchBoosted();
                    refetchNormal();
                },
            };
        }

        if (routesLoading || isBoostedQuotesLoading || isNormalQuotesLoading) {
            return {
                state: TradeState.LOADING,
                trade: null,
            };
        }

        // Omega Router: use all routes (boosted + normal)
        // Native Router: use only normal routes (doesn't support boosted)
        const activeRoutes = routerType === RouterType.OMEGA ? [...boostedRoutes, ...normalRoutes] : normalRoutes;
        const activeQuotesResults =
            routerType === RouterType.OMEGA ? [...(boostedQuotesResults || []), ...(normalQuotesResults || [])] : normalQuotesResults || [];

        type BestRouteResultOut = {
            bestRoute: Route<Currency, Currency> | BoostedRoute<Currency, Currency> | null;
            amountIn: bigint | null;
            fee: number[] | null;
            priceAfterSwap: bigint[] | null;
            stepAmountsOut: string[] | null;
        };

        const { bestRoute, amountIn, fee, priceAfterSwap, stepAmountsOut } = activeQuotesResults.reduce<BestRouteResultOut>(
            (currentBest, result, i) => {
                if (!result) return currentBest;

                const resultAmountIn = result[1][result[1].length - 1];

                if (currentBest.amountIn === null) {
                    return {
                        bestRoute: activeRoutes[i] as Route<Currency, Currency> | BoostedRoute<Currency, Currency>,
                        amountIn: resultAmountIn,
                        fee: result[5],
                        priceAfterSwap: result[2],
                        stepAmountsOut: [...result[0]].reverse().map((a: bigint) => a.toString()),
                    };
                } else if (currentBest.amountIn > resultAmountIn) {
                    return {
                        bestRoute: activeRoutes[i] as Route<Currency, Currency> | BoostedRoute<Currency, Currency>,
                        amountIn: resultAmountIn,
                        fee: result[5],
                        priceAfterSwap: result[2],
                        stepAmountsOut: [...result[0]].reverse().map((a: bigint) => a.toString()),
                    };
                }

                return currentBest;
            },
            {
                bestRoute: null,
                amountIn: null,
                fee: null,
                priceAfterSwap: null,
                stepAmountsOut: null,
            }
        );

        if (!bestRoute || !amountIn) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
                fee: null,
                priceAfterSwap,
                priceImpact: null,
                stepAmountsOut: null,
            };
        }

        const priceImpact = priceAfterSwap ? calculatePriceImpact(bestRoute, [...priceAfterSwap].reverse()) : null;

        return {
            state: TradeState.VALID,
            fee,
            trade: Trade.createUncheckedTrade({
                route: bestRoute,
                tradeType: TradeType.EXACT_OUTPUT,
                inputAmount: CurrencyAmount.fromRawAmount(currencyIn, amountIn.toString()),
                outputAmount: amountOut,
            }),
            priceAfterSwap,
            priceImpact,
            stepAmountsOut,
            refetch: () => {
                refetchBoosted();
                refetchNormal();
            },
        };
    }, [
        amountOut,
        currencyIn,
        boostedQuotesResults,
        normalQuotesResults,
        boostedRoutes,
        normalRoutes,
        routesLoading,
        isBoostedQuotesLoading,
        isNormalQuotesLoading,
        refetchBoosted,
        refetchNormal,
        routerType,
    ]);

    return trade;
}
