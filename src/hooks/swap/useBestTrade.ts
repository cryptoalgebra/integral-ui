import { Currency, CurrencyAmount, Route, Trade, TradeType, encodeRouteToPath } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { useAllRoutes } from "./useAllRoutes";
import { useContractReads } from "wagmi";
import { ALGEBRA_QUOTER } from "@/constants/addresses";
import { algebraQuoterABI } from "@/abis";
import { TradeState, TradeStateType } from "@/types/trade-state";


// const DEFAULT_GAS_QUOTE = 2_000_000

/**
 * Returns the best v3 trade for a desired exact input swap
 * @param amountIn the amount to swap in
 * @param currencyOut the desired output currency
 */
export function useBestTradeExactIn(
    amountIn?: CurrencyAmount<Currency>,
    currencyOut?: Currency
): { state: TradeStateType; trade: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null; fee?: bigint[] | null } {

    const { routes, loading: routesLoading } = useAllRoutes(amountIn?.currency, currencyOut)

    const quoteExactInInputs = useMemo(() => {
        return routes.map((route) => [
            encodeRouteToPath(route, false),
            amountIn ? `0x${amountIn.quotient.toString(16)}` : undefined,
        ])
    }, [amountIn, routes])

    const { data: quotesResults, isLoading: isQuotesLoading } = useContractReads({
        contracts: quoteExactInInputs.map((quote: any) => ({
            address: ALGEBRA_QUOTER,
            abi: algebraQuoterABI,
            functionName: 'quoteExactInput',
            args: quote
        })),
        cacheTime: 5_000
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

        const { bestRoute, amountOut, fee } = (quotesResults || []).reduce(
            (currentBest: { bestRoute: Route<Currency, Currency> | null; amountOut: any | null; fee: bigint[] | null }, { result }: any, i) => {
                if (!result) return currentBest

                if (currentBest.amountOut === null) {
                    return {
                        bestRoute: routes[i],
                        amountOut: result[0],
                        fee: result[1]
                    }
                } else if (currentBest.amountOut < result[0]) {
                    return {
                        bestRoute: routes[i],
                        amountOut: result[0],
                        fee: result[1]
                    }
                }

                return currentBest
            },
            {
                bestRoute: null,
                amountOut: null,
                fee: null
            }
        )

        if (!bestRoute || !amountOut) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
                fee: null
            }
        }

        return {
            state: TradeState.VALID,
            fee,
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
): { state: TradeStateType; trade: Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null; fee?: bigint[] | null } {

    const { routes, loading: routesLoading } = useAllRoutes(currencyIn, amountOut?.currency)

    const quoteExactOutInputs = useMemo(() => {
        return routes.map((route) => [
            encodeRouteToPath(route, true),
            amountOut ? `0x${amountOut.quotient.toString(16)}` : undefined,
        ])
    }, [amountOut, routes])

    const { data: quotesResults, isLoading: isQuotesLoading, isError: isQuotesErrored } = useContractReads({
        contracts: quoteExactOutInputs.map((quote: any) => ({
            address: ALGEBRA_QUOTER,
            abi: algebraQuoterABI,
            functionName: 'quoteExactOutput',
            args: quote
        })),
        cacheTime: 5_000
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

        const { bestRoute, amountIn, fee } = (quotesResults || []).reduce(
            (currentBest: { bestRoute: Route<Currency, Currency> | null; amountIn: any | null; fee: bigint[] | null }, { result }: any, i) => {
                if (!result) return currentBest

                if (currentBest.amountIn === null) {
                    return {
                        bestRoute: routes[i],
                        amountIn: result[0],
                        fee: result[1]
                    }
                } else if (currentBest.amountIn > result[0]) {
                    return {
                        bestRoute: routes[i],
                        amountIn: result[0],
                        fee: result[1]
                    }
                }

                return currentBest
            },
            {
                bestRoute: null,
                amountIn: null,
                fee: null
            }
        )

        if (!bestRoute || !amountIn) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
                fee: null
            }
        }

        return {
            state: TradeState.VALID,
            fee,
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
