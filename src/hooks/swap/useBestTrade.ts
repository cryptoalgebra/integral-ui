import { Currency, CurrencyAmount, Route, Trade, TradeType, encodeRouteToPath } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { useAllRoutes } from "./useAllRoutes";
import { useContractReads } from "wagmi";
import { ALGEBRA_QUOTER } from "@/constants/addresses";
import { algebraQuoterABI } from "@/abis";
import { TradeState, TradeStateType } from "@/types/trade-state";


const DEFAULT_GAS_QUOTE = 2_000_000

/**
 * Returns the best v3 trade for a desired exact input swap
 * @param amountIn the amount to swap in
 * @param currencyOut the desired output currency
 */
export function useBestTradeExactIn(
    amountIn?: CurrencyAmount<Currency>,
    currencyOut?: Currency
): { state: TradeStateType; trade: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null } {

    const { routes, loading: routesLoading } = useAllRoutes(amountIn?.currency, currencyOut)

    const quoteExactInInputs = useMemo(() => {
        return routes.map((route) => [
            encodeRouteToPath(route, false),
            amountIn ? `0x${amountIn.quotient.toString(16)}` : undefined,
        ])
    }, [amountIn, routes])

    const { data: quotesResults, isLoading: isQuotesLoading } = useContractReads({
        contracts: quoteExactInInputs.map((quote) => ({
            address: ALGEBRA_QUOTER,
            abi: algebraQuoterABI,
            functionName: 'quoteExactInput',
            args: [...quote],
        }))
    })

    const trade = useMemo(() => {
        if (!amountIn || !currencyOut) {
            return {
                state: TradeState.INVALID,
                trade: null,
            }
        }

        if (routesLoading || isQuotesLoading) {
            return {
                state: TradeState.LOADING,
                trade: null,
            }
        }

        const { bestRoute, amountOut } = (quotesResults || []).reduce(
            (currentBest: { bestRoute: Route<Currency, Currency> | null; amountOut: any | null }, { result }: any, i) => {
                if (!result) return currentBest

                if (currentBest.amountOut === null) {
                    return {
                        bestRoute: routes[i],
                        amountOut: result[0],
                    }
                } else if (currentBest.amountOut.lt(result[0])) {
                    return {
                        bestRoute: routes[i],
                        amountOut: result[0],
                    }
                }

                return currentBest
            },
            {
                bestRoute: null,
                amountOut: null,
            }
        )

        if (!bestRoute || !amountOut) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
            }
        }

        // const isSyncing = quotesResults.some(({ syncing }) => syncing)

        return {
            // state: isSyncing ? TradeState.SYNCING : TradeState.VALID,
            state: TradeState.VALID,
            trade: Trade.createUncheckedTrade({
                route: bestRoute,
                tradeType: TradeType.EXACT_INPUT,
                inputAmount: amountIn,
                outputAmount: CurrencyAmount.fromRawAmount(currencyOut, amountOut.toString()),
            }),
        }
    }, [amountIn, currencyOut, quotesResults, routes, routesLoading])


    return useMemo(() => {
        return trade
    }, [trade])
}

/**
 * Returns the best v3 trade for a desired exact output swap
 * @param currencyIn the desired input currency
 * @param amountOut the amount to swap out
 */
export function useBestTradeExactOut(
    currencyIn?: Currency,
    amountOut?: CurrencyAmount<Currency>
): { state: TradeStateType; trade: Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null } {

    const { routes, loading: routesLoading } = useAllRoutes(currencyIn, amountOut?.currency)

    const quoteExactOutInputs = useMemo(() => {
        return routes.map((route) => [
            encodeRouteToPath(route, true),
            amountOut ? `0x${amountOut.quotient.toString(16)}` : undefined,
        ])
    }, [amountOut, routes])

    const { data: quotesResults, isLoading: isQuotesLoading, isError: isQuotesErrored } = useContractReads({
        contracts: quoteExactOutInputs.map((quote) => ({
            address: ALGEBRA_QUOTER,
            abi: algebraQuoterABI,
            functionName: 'quoteExactOutput',
            args: [quote],
        }))
    })

    const trade = useMemo(() => {
        if (!amountOut || !currencyIn || isQuotesErrored) {
            return {
                state: TradeState.INVALID,
                trade: null,
            }
        }

        if (routesLoading || isQuotesLoading) {
            return {
                state: TradeState.LOADING,
                trade: null,
            }
        }

        const { bestRoute, amountIn } = (quotesResults || []).reduce(
            (currentBest: { bestRoute: Route<Currency, Currency> | null; amountIn: any | null }, { result }: any, i) => {
                if (!result) return currentBest

                if (currentBest.amountIn === null) {
                    return {
                        bestRoute: routes[i],
                        amountIn: result[0],
                    }
                } else if (currentBest.amountIn.gt(result[0])) {
                    return {
                        bestRoute: routes[i],
                        amountIn: result[0],
                    }
                }

                return currentBest
            },
            {
                bestRoute: null,
                amountIn: null,
            }
        )

        if (!bestRoute || !amountIn) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
            }
        }

        // const isSyncing = quotesResults.some(({ syncing }) => syncing)

        return {
            // state: isSyncing ? TradeState.SYNCING : TradeState.VALID,
            state: TradeState.VALID,
            trade: Trade.createUncheckedTrade({
                route: bestRoute,
                tradeType: TradeType.EXACT_OUTPUT,
                inputAmount: CurrencyAmount.fromRawAmount(currencyIn, amountIn.toString()),
                outputAmount: amountOut,
            }),
        }
    }, [amountOut, currencyIn, quotesResults, routes, routesLoading])


    return useMemo(() => {
        return trade
    }, [trade])
}
