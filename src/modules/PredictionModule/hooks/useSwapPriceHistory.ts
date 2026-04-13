import { useClients } from "@/hooks/graphql/useClients";
import { useMemo, useEffect, useRef, useState, useCallback } from "react";
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
    lastSwapTimestamp: number | undefined;
    isLoading: boolean;
}

export function useSwapPriceHistory(
    poolAddress: Address | undefined,
    marketCurrency: Currency | undefined,
    quoteCurrency: Currency | undefined,
): UseSwapPriceHistoryResult {
    const { infoClient } = useClients();

    const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
    const lastProcessedSwapsRef = useRef<string>("");

    const now = useMemo(() => Math.floor(Date.now() / 1000), []);
    const timestamp_gt = useMemo(() => now - 7 * 24 * 60 * 60, [now]); // 7 days

    const { data, loading } = useSwapTransactionsQuery({
        variables: {
            where: {
                pool: poolAddress?.toLowerCase(),
                timestamp_gt: timestamp_gt.toString(),
            },
        },
        client: infoClient,
        skip: !poolAddress || !infoClient,
        pollInterval: 3000,
        fetchPolicy: "network-only",
    });

    // Convert tick to price - memoized converter function
    const tickToActualPrice = useCallback(
        (tick: number): number => {
            if (!marketCurrency || !quoteCurrency) return 0;
            try {
                const price = tickToPrice(marketCurrency.wrapped, quoteCurrency.wrapped, tick);
                return parseFloat(price.toSignificant(8));
            } catch {
                return 0;
            }
        },
        [marketCurrency, quoteCurrency],
    );

    // Process swaps into sorted price points
    useEffect(() => {
        if (!marketCurrency || !quoteCurrency) return;

        const swaps = data?.swaps;
        if (!swaps?.length) {
            // Keep existing history if no new data
            return;
        }

        // Create a hash to detect changes
        const swapsHash = swaps.map((s) => `${s.timestamp}-${s.tick}`).join("|");
        if (swapsHash === lastProcessedSwapsRef.current) {
            return; // No change in swaps
        }
        lastProcessedSwapsRef.current = swapsHash;

        // Sort swaps by timestamp ascending
        const sortedSwaps = [...swaps].sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp));

        // Convert to price points
        const points: PricePoint[] = [];

        for (const swap of sortedSwaps) {
            const timestamp = parseInt(swap.timestamp);
            const tick = parseInt(swap.tick);
            const price = tickToActualPrice(tick);

            if (price > 0) {
                points.push({
                    timestamp,
                    price,
                    isSwap: true,
                });
            }
        }

        if (points.length === 0) return;

        // Interpolate between swaps for smooth chart (but not every second)
        const interpolatedPoints: PricePoint[] = [];
        const now = Math.floor(Date.now() / 1000);

        for (let i = 0; i < points.length; i++) {
            const current = points[i];
            interpolatedPoints.push(current);

            // Add interpolated point before next swap or at current time
            const nextTimestamp = i < points.length - 1 ? points[i + 1].timestamp : now;
            const gap = nextTimestamp - current.timestamp;

            // Only interpolate if gap is significant (> 30 seconds)
            if (gap > 30) {
                // Add a few interpolated points
                const steps = Math.min(Math.floor(gap / 30), 10);
                const stepSize = gap / (steps + 1);

                for (let j = 1; j <= steps; j++) {
                    interpolatedPoints.push({
                        timestamp: Math.floor(current.timestamp + stepSize * j),
                        price: current.price,
                        isSwap: false,
                    });
                }
            }
        }

        // Add current time point with last known price
        const lastPrice = points[points.length - 1].price;
        const lastTimestamp = points[points.length - 1].timestamp;
        if (now > lastTimestamp) {
            interpolatedPoints.push({
                timestamp: now,
                price: lastPrice,
                isSwap: false,
            });
        }

        setPriceHistory(interpolatedPoints);
    }, [data, tickToActualPrice, marketCurrency, quoteCurrency]);

    // Extend history to current time on each render
    useEffect(() => {
        if (priceHistory.length === 0) return;

        const now = Math.floor(Date.now() / 1000);
        const lastPoint = priceHistory[priceHistory.length - 1];

        // If last point is old, add a new point at current time
        if (now - lastPoint.timestamp > 5) {
            setPriceHistory((prev) => [
                ...prev,
                {
                    timestamp: now,
                    price: lastPoint.price,
                    isSwap: false,
                },
            ]);
        }
    }, [priceHistory]);

    // Derived values
    const currentPrice = useMemo(() => {
        if (priceHistory.length === 0) return undefined;
        return priceHistory[priceHistory.length - 1].price;
    }, [priceHistory]);

    const { lastSwapPrice, lastSwapTimestamp } = useMemo(() => {
        for (let i = priceHistory.length - 1; i >= 0; i--) {
            if (priceHistory[i].isSwap) {
                return {
                    lastSwapPrice: priceHistory[i].price,
                    lastSwapTimestamp: priceHistory[i].timestamp,
                };
            }
        }
        return { lastSwapPrice: undefined, lastSwapTimestamp: undefined };
    }, [priceHistory]);

    return {
        priceHistory,
        currentPrice,
        lastSwapPrice,
        lastSwapTimestamp,
        isLoading: loading,
    };
}
