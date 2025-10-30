import { Currency, CurrencyAmount, Route, Trade, TradeType } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { TradeState, TradeStateType } from "@/types/trade-state";
import { useAllRoutes } from "./useAllRoutes";
import { useBoostedQuotesResults } from "./useBoostedQuotesResults";
import { useQuotesResults } from "./useQuotesResults";
import { BoostedRoute } from "sdk-updates/boostedRoute";

// const DEFAULT_GAS_QUOTE = 2_000_000

export interface BestTradeExactIn {
    state: TradeStateType;
    trade: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null;
    fee?: number[] | null;
    priceAfterSwap?: bigint[] | null;
}

export interface BestTradeExactOut {
    state: TradeStateType;
    trade: Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null;
    fee?: number[] | null;
    priceAfterSwap?: bigint[] | null;
}

/**
 * Returns the best v3 trade for a desired exact input swap
 * @param amountIn the amount to swap in
 * @param currencyOut the desired output currency
 */
export function useBestTradeExactIn(amountIn?: CurrencyAmount<Currency>, currencyOut?: Currency): BestTradeExactIn {
    const { boostedRoutes, normalRoutes, loading: routesLoading } = useAllRoutes(amountIn?.currency, currencyOut);

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

        // Combine boosted and normal routes/quotes
        const allRoutes = [...boostedRoutes, ...normalRoutes];
        const allQuotesResults = [...(boostedQuotesResults || []), ...(normalQuotesResults || [])];

        const { bestRoute, amountOut, fee, priceAfterSwap } = allQuotesResults.reduce(
            (
                currentBest: {
                    bestRoute: Route<Currency, Currency> | BoostedRoute<Currency, Currency> | null;
                    amountOut: bigint | null;
                    fee: number[] | null;
                    priceAfterSwap: bigint[] | null;
                },
                result,
                i
            ) => {
                if (!result) return currentBest;

                // result[0] = amountOutList, берем последний элемент
                const resultAmountOut = result[0][result[0].length - 1];

                if (currentBest.amountOut === null) {
                    return {
                        bestRoute: allRoutes[i],
                        amountOut: resultAmountOut,
                        fee: result[5],
                        priceAfterSwap: result[2],
                    };
                } else if (currentBest.amountOut < resultAmountOut) {
                    return {
                        bestRoute: allRoutes[i],
                        amountOut: resultAmountOut,
                        fee: result[5],
                        priceAfterSwap: result[2],
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
            };
        }

        return {
            state: TradeState.VALID,
            fee,
            trade: Trade.createUncheckedTrade({
                route: bestRoute as Route<Currency, Currency>,
                tradeType: TradeType.EXACT_INPUT,
                inputAmount: amountIn,
                outputAmount: CurrencyAmount.fromRawAmount(currencyOut, amountOut.toString()),
            }),
            priceAfterSwap,
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
    ]);

    return trade;
}

/**
 * Returns the best v3 trade for a desired exact output swap
 * @param currencyIn the desired input currency
 * @param amountOut the amount to swap out
 */
export function useBestTradeExactOut(currencyIn?: Currency, amountOut?: CurrencyAmount<Currency>): BestTradeExactOut {
    const { boostedRoutes, normalRoutes, loading: routesLoading } = useAllRoutes(currencyIn, amountOut?.currency);

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

        // Combine boosted and normal routes/quotes
        const allRoutes = [...boostedRoutes, ...normalRoutes];
        const allQuotesResults = [...(boostedQuotesResults || []), ...(normalQuotesResults || [])];

        const { bestRoute, amountIn, fee, priceAfterSwap } = allQuotesResults.reduce(
            (
                currentBest: {
                    bestRoute: Route<Currency, Currency> | BoostedRoute<Currency, Currency> | null;
                    amountIn: bigint | null;
                    fee: number[] | null;
                    priceAfterSwap: bigint[] | null;
                },
                result,
                i
            ) => {
                if (!result) return currentBest;

                // result[1] = amountInList, берем последний элемент
                const resultAmountIn = result[1][result[1].length - 1];

                if (currentBest.amountIn === null) {
                    return {
                        bestRoute: allRoutes[i],
                        amountIn: resultAmountIn,
                        fee: result[5],
                        priceAfterSwap: result[2],
                    };
                } else if (currentBest.amountIn > resultAmountIn) {
                    // Для exactOutput лучший маршрут - тот, что требует меньше входного токена
                    return {
                        bestRoute: allRoutes[i],
                        amountIn: resultAmountIn,
                        fee: result[5],
                        priceAfterSwap: result[2],
                    };
                }

                return currentBest;
            },
            {
                bestRoute: null,
                amountIn: null,
                fee: null,
                priceAfterSwap: null,
            }
        );

        if (!bestRoute || !amountIn) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
                fee: null,
                priceAfterSwap,
            };
        }

        return {
            state: TradeState.VALID,
            fee,
            trade: Trade.createUncheckedTrade({
                route: bestRoute as Route<Currency, Currency>,
                tradeType: TradeType.EXACT_OUTPUT,
                inputAmount: CurrencyAmount.fromRawAmount(currencyIn, amountIn.toString()),
                outputAmount: amountOut,
            }),
            priceAfterSwap,
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
    ]);

    return trade;
}
