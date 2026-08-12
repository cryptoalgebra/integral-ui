import { Currency, CurrencyAmount, Percent, Route, TradeType, Trade, BoostedRoute } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { TradeState, TradeStateType } from "@/types/trade-state";
import { useAllRoutes } from "./useAllRoutes";
import { useQuotesResults } from "./useQuotesResults";
import { RouterType, useSwapState } from "@/state/swapStore";
import { calculatePriceImpact } from "@/utils/swap/calculatePriceImpact";

import BoostedPoolsModule from "@/modules/BoostedPoolsModule";
const { useBoostedQuotesResults } = BoostedPoolsModule.hooks;

import KYCModule from "@/modules/KYCModule";
import { EMPTY_KYC_QUOTE_STATE, type KycQuoteState } from "@/types/kyc";
import { enabledModules } from "config";
const { useKycQuotePolicy } = KYCModule.hooks;

// const DEFAULT_GAS_QUOTE = 2_000_000

export interface BestTradeExactIn {
    state: TradeStateType;
    trade: Trade<Currency, Currency, TradeType.EXACT_INPUT> | null;
    fee?: number[] | null;
    priceAfterSwap?: bigint[] | null;
    priceImpact?: Percent | null;
    kycQuoteState: KycQuoteState;
    refetch: () => void;
}

export interface BestTradeExactOut {
    state: TradeStateType;
    trade: Trade<Currency, Currency, TradeType.EXACT_OUTPUT> | null;
    fee?: number[] | null;
    priceAfterSwap?: bigint[] | null;
    priceImpact?: Percent | null;
    kycQuoteState: KycQuoteState;
    refetch: () => void;
}

/**
 * Returns the best v3 trade for a desired exact input swap
 * @param amountIn the amount to swap in
 * @param currencyOut the desired output currency
 */
export function useBestTradeExactIn(amountIn?: CurrencyAmount<Currency>, currencyOut?: Currency): BestTradeExactIn {
    const { routerType } = useSwapState();
    const candidateRoutes = useAllRoutes(amountIn?.currency, currencyOut);
    const candidateBoostedRoutes = useMemo(
        () => (routerType === RouterType.OMEGA ? candidateRoutes.boostedRoutes : []),
        [candidateRoutes.boostedRoutes, routerType],
    );
    const kycPolicy = useKycQuotePolicy({
        normalRoutes: candidateRoutes.normalRoutes,
        boostedRoutes: candidateBoostedRoutes,
    });

    const boostedRoutes = useMemo(
        () => (enabledModules.KYCModule ? kycPolicy.boostedRoutes : candidateBoostedRoutes),
        [candidateBoostedRoutes, kycPolicy.boostedRoutes],
    );
    const normalRoutes = useMemo(
        () => (enabledModules.KYCModule ? kycPolicy.normalRoutes : candidateRoutes.normalRoutes),
        [candidateRoutes.normalRoutes, kycPolicy.normalRoutes],
    );
    const kycQuoteState = enabledModules.KYCModule ? kycPolicy.kycQuoteState : EMPTY_KYC_QUOTE_STATE;

    const { data: boostedQuotesResults, isLoading: isBoostedQuotesLoading, refetch: refetchBoosted } = useBoostedQuotesResults({
        exactInput: true,
        amountIn,
        routes: boostedRoutes,
    });

    const { data: normalQuotesResults, isLoading: isNormalQuotesLoading, refetch: refetchNormal } = useQuotesResults({
        exactInput: true,
        amountIn,
        routes: normalRoutes,
    });

    const trade = useMemo(() => {
        const refetch = () => {
            if (routerType === RouterType.OMEGA) {
                refetchBoosted?.();
            }
            refetchNormal();
            kycQuoteState.refetch();
        };

        if (!amountIn || !currencyOut) {
            return {
                state: TradeState.INVALID,
                trade: null,
                kycQuoteState,
                refetch,
            };
        }

        if (candidateRoutes.loading || kycQuoteState.isLoading || isBoostedQuotesLoading || isNormalQuotesLoading) {
            return {
                state: TradeState.LOADING,
                trade: null,
                kycQuoteState,
                refetch,
            };
        }

        if (kycQuoteState.isError) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
                kycQuoteState,
                refetch,
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
                    };
                } else if (currentBest.amountOut < resultAmountOut) {
                    return {
                        bestRoute: activeRoutes[i] as Route<Currency, Currency> | BoostedRoute<Currency, Currency>,
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
            },
        );

        if (!bestRoute || !amountOut) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
                fee: null,
                priceAfterSwap: null,
                priceImpact: null,
                kycQuoteState,
                refetch,
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
            kycQuoteState,
            refetch,
        };
    }, [
        amountIn,
        currencyOut,
        boostedQuotesResults,
        normalQuotesResults,
        boostedRoutes,
        normalRoutes,
        candidateRoutes.loading,
        isBoostedQuotesLoading,
        isNormalQuotesLoading,
        refetchBoosted,
        refetchNormal,
        routerType,
        kycQuoteState,
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
    const candidateRoutes = useAllRoutes(currencyIn, amountOut?.currency);
    const candidateBoostedRoutes = useMemo(
        () => (routerType === RouterType.OMEGA ? candidateRoutes.boostedRoutes : []),
        [candidateRoutes.boostedRoutes, routerType],
    );
    const kycPolicy = useKycQuotePolicy({
        normalRoutes: candidateRoutes.normalRoutes,
        boostedRoutes: candidateBoostedRoutes,
    });
    const boostedRoutes = useMemo(
        () => (enabledModules.KYCModule ? kycPolicy.boostedRoutes : candidateBoostedRoutes),
        [candidateBoostedRoutes, kycPolicy.boostedRoutes],
    );
    const normalRoutes = useMemo(
        () => (enabledModules.KYCModule ? kycPolicy.normalRoutes : candidateRoutes.normalRoutes),
        [candidateRoutes.normalRoutes, kycPolicy.normalRoutes],
    );
    const kycQuoteState = enabledModules.KYCModule ? kycPolicy.kycQuoteState : EMPTY_KYC_QUOTE_STATE;

    const { data: boostedQuotesResults, isLoading: isBoostedQuotesLoading, refetch: refetchBoosted } = useBoostedQuotesResults({
        exactInput: false,
        amountOut,
        routes: boostedRoutes,
    });

    const { data: normalQuotesResults, isLoading: isNormalQuotesLoading, refetch: refetchNormal } = useQuotesResults({
        exactInput: false,
        amountOut,
        routes: normalRoutes,
    });

    const trade = useMemo(() => {
        const refetch = () => {
            if (routerType === RouterType.OMEGA) {
                refetchBoosted?.();
            }
            refetchNormal();
            kycQuoteState.refetch();
        };

        if (!amountOut || !currencyIn) {
            return {
                state: TradeState.INVALID,
                trade: null,
                kycQuoteState,
                refetch,
            };
        }

        if (candidateRoutes.loading || kycQuoteState.isLoading || isBoostedQuotesLoading || isNormalQuotesLoading) {
            return {
                state: TradeState.LOADING,
                trade: null,
                kycQuoteState,
                refetch,
            };
        }

        if (kycQuoteState.isError) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
                kycQuoteState,
                refetch,
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
        };

        const { bestRoute, amountIn, fee, priceAfterSwap } = activeQuotesResults.reduce<BestRouteResultOut>(
            (currentBest, result, i) => {
                if (!result) return currentBest;

                const resultAmountIn = result[1][result[1].length - 1];

                if (currentBest.amountIn === null) {
                    return {
                        bestRoute: activeRoutes[i] as Route<Currency, Currency> | BoostedRoute<Currency, Currency>,
                        amountIn: resultAmountIn,
                        fee: result[5],
                        priceAfterSwap: result[2],
                    };
                } else if (currentBest.amountIn > resultAmountIn) {
                    return {
                        bestRoute: activeRoutes[i] as Route<Currency, Currency> | BoostedRoute<Currency, Currency>,
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
            },
        );

        if (!bestRoute || !amountIn) {
            return {
                state: TradeState.NO_ROUTE_FOUND,
                trade: null,
                fee: null,
                priceAfterSwap,
                priceImpact: null,
                kycQuoteState,
                refetch,
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
            kycQuoteState,
            refetch,
        };
    }, [
        amountOut,
        currencyIn,
        boostedQuotesResults,
        normalQuotesResults,
        boostedRoutes,
        normalRoutes,
        candidateRoutes.loading,
        isBoostedQuotesLoading,
        isNormalQuotesLoading,
        refetchBoosted,
        refetchNormal,
        routerType,
        kycQuoteState,
    ]);

    return trade;
}
