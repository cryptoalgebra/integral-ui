import { Currency, CurrencyAmount, Route, Trade, TradeType, encodeRouteToPath } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { useAllRoutes } from "./useAllRoutes";
import { useContractReads } from "wagmi";
import { ALGEBRA_QUOTER_V2 } from "@/constants/addresses";
import { algebraQuoterV2ABI } from "@/abis";
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
): { state: TradeStateType; trade: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null; fee?: bigint[] | null, priceAfterSwap?: bigint[] | null } {

    const { routes, loading: routesLoading } = useAllRoutes(amountIn?.currency, currencyOut)

    const quoteExactInInputs = useMemo(() => {
        return routes.map((route) => [
            encodeRouteToPath(route, false),
            amountIn ? `0x${amountIn.quotient.toString(16)}` : undefined,
        ])
    }, [amountIn, routes])

    const { data: quotesResults, isLoading: isQuotesLoading } = useContractReads({
        contracts: quoteExactInInputs.map((quote: any) => ({
            address: ALGEBRA_QUOTER_V2,
            abi: algebraQuoterV2ABI,
            functionName: 'quoteExactInput',
            args: quote
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

        const { bestRoute, amountOut, fee, priceAfterSwap } = (quotesResults || []).reduce(
            (currentBest: { bestRoute: Route<Currency, Currency> | null; amountOut: any | null; fee: bigint[] | null, priceAfterSwap: bigint[] | null }, { result }: any, i) => {
                if (!result) return currentBest

                if (currentBest.amountOut === null) {
                    return {
                        bestRoute: routes[i],
                        amountOut: result[0],
                        fee: result[5],
                        priceAfterSwap: result[2]
                    }
                } else if (currentBest.amountOut < result[0]) {
                    return {
                        bestRoute: routes[i],
                        amountOut: result[0],
                        fee: result[5],
                        priceAfterSwap: result[2]
                    }
                }

                return currentBest
            },
            {
                bestRoute: null,
                amountOut: null,
                fee: null,
                priceAfterSwap: null
            }
        )

        if (!bestRoute || !amountOut) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
                fee: null,
                priceAfterSwap: null
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
            priceAfterSwap
        }
    }, [amountIn, currencyOut, quotesResults, routes, routesLoading, isQuotesLoading])

    return trade
}

/**
 * Returns the best v3 trade for a desired exact output swap
 * @param currencyIn the desired input currency
 * @param amountOut the amount to swap out
 */
export function useBestTradeExactOut(
    currencyIn?: Currency,
    amountOut?: CurrencyAmount<Currency>
): { state: TradeStateType; trade: Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null; fee?: bigint[] | null, priceAfterSwap?: bigint[] | null } {

    const { routes, loading: routesLoading } = useAllRoutes(currencyIn, amountOut?.currency)

    const quoteExactOutInputs = useMemo(() => {
        return routes.map((route) => [
            encodeRouteToPath(route, true),
            amountOut ? `0x${amountOut.quotient.toString(16)}` : undefined,
        ])
    }, [amountOut, routes])

    const { data: quotesResults, isLoading: isQuotesLoading, isError: isQuotesErrored } = useContractReads({
        contracts: quoteExactOutInputs.map((quote: any) => ({
            address: ALGEBRA_QUOTER_V2,
            abi: algebraQuoterV2ABI,
            functionName: 'quoteExactOutput',
            args: quote
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

        const { bestRoute, amountIn, fee, priceAfterSwap } = (quotesResults || []).reduce(
            (currentBest: { bestRoute: Route<Currency, Currency> | null; amountIn: any | null; fee: bigint[] | null, priceAfterSwap: bigint[] | null }, { result }: any, i) => {
                if (!result) return currentBest

                if (currentBest.amountIn === null) {
                    return {
                        bestRoute: routes[i],
                        amountIn: result[1],
                        fee: result[5],
                        priceAfterSwap: result[2]
                    }
                } else if (currentBest.amountIn > result[0]) {
                    return {
                        bestRoute: routes[i],
                        amountIn: result[1],
                        fee: result[5],
                        priceAfterSwap: result[2]
                    }
                }

                return currentBest
            },
            {
                bestRoute: null,
                amountIn: null,
                fee: null,
                priceAfterSwap: null
            }
        )

        if (!bestRoute || !amountIn) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
                fee: null,
                priceAfterSwap
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
            priceAfterSwap
        }
    }, [amountOut, currencyIn, quotesResults, routes, routesLoading, isQuotesLoading])


    return trade
}
