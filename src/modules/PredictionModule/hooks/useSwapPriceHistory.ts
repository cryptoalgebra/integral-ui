import { useClients } from "@/hooks/graphql/useClients";
import { useMemo } from "react";
import { Address } from "viem";
import { Currency, tickToPrice } from "@cryptoalgebra/integral-sdk";
import { useSwapTransactionsQuery } from "@/graphql/generated/graphql";

export interface PricePoint {
    timestamp: number;
    price: number;
    isSwap: boolean;
}

interface UseSwapPriceHistoryResult {
    priceHistory: PricePoint[];
    currentPrice: number | undefined;
    lastSwapPrice: number | undefined;
    isLoading: boolean;
}

export function useSwapPriceHistory(
    poolAddress: Address | undefined,
    marketCurrency: Currency | undefined,
    quoteCurrency: Currency | undefined,
    lookbackSeconds: number = 7 * 24 * 60 * 60, // 7 days default
    pollIntervalMs: number = 5000,
): UseSwapPriceHistoryResult {
    const { infoClient } = useClients();

    const timestampGt = useMemo(() => {
        return Math.floor(Date.now() / 1000) - lookbackSeconds;
    }, [lookbackSeconds]);

    const { data, loading } = useSwapTransactionsQuery({
        variables: {
            where: {
                pool: poolAddress?.toLowerCase(),
                timestamp_gt: timestampGt.toString(),
            },
        },
        client: infoClient,
        skip: !poolAddress || !infoClient,
        pollInterval: pollIntervalMs,
    });

    const priceHistory = useMemo<PricePoint[]>(() => {
        if (!data?.swaps?.length || !marketCurrency || !quoteCurrency) {
            return [];
        }

        // Sort swaps by timestamp
        const sortedSwaps = [...data.swaps].sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

        // Convert to price points
        const points: PricePoint[] = [];

        for (const swap of sortedSwaps) {
            try {
                const tick = parseInt(swap.tick);
                const priceObj = tickToPrice(marketCurrency.wrapped, quoteCurrency.wrapped, tick);
                const price = parseFloat(priceObj.toSignificant(8));

                if (price > 0) {
                    points.push({
                        timestamp: parseInt(swap.timestamp),
                        price,
                        isSwap: true,
                    });
                }
            } catch {
                // Skip invalid ticks
            }
        }

        // Add current time point with last known price for chart continuity
        if (points.length > 0) {
            const lastPoint = points[points.length - 1];
            const now = Math.floor(Date.now() / 1000);

            if (now - lastPoint.timestamp > 10) {
                points.push({
                    timestamp: now,
                    price: lastPoint.price,
                    isSwap: false,
                });
            }
        }

        return points;
    }, [data?.swaps, marketCurrency, quoteCurrency]);

    const currentPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].price : undefined;

    const lastSwapPrice = useMemo(() => {
        for (let i = priceHistory.length - 1; i >= 0; i--) {
            if (priceHistory[i].isSwap) {
                return priceHistory[i].price;
            }
        }
        return undefined;
    }, [priceHistory]);

    return {
        priceHistory,
        currentPrice,
        lastSwapPrice,
        isLoading: loading,
    };
}
