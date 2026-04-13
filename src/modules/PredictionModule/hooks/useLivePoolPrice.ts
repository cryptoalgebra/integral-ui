import { useReadAlgebraPoolGlobalState } from "@/generated";
import { tickToPrice } from "@cryptoalgebra/integral-sdk";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useEffect, useMemo, useRef, useState } from "react";
import { Address } from "viem";

interface LivePricePoint {
    timestamp: number;
    price: number;
}

interface UseLivePoolPriceResult {
    currentPrice: number | undefined;
    priceHistory: LivePricePoint[];
    isLoading: boolean;
}

export function useLivePoolPrice(
    poolAddress: Address | undefined,
    token0Address: Address | undefined,
    token1Address: Address | undefined,
    marketToken: number = 0,
    pollIntervalMs: number = 1000,
): UseLivePoolPriceResult {
    const [priceHistory, setPriceHistory] = useState<LivePricePoint[]>([]);

    const token0 = useCurrency(token0Address);
    const token1 = useCurrency(token1Address);

    // marketCurrency is what we're pricing, quoteCurrency is the unit
    const marketCurrency = marketToken === 0 ? token0 : token1;
    const quoteCurrency = marketToken === 0 ? token1 : token0;

    const { data: globalState, isLoading } = useReadAlgebraPoolGlobalState({
        address: poolAddress,
        query: {
            refetchInterval: pollIntervalMs,
        },
    });

    // Track last tick to detect real changes
    const lastTickRef = useRef<number | null>(null);

    const currentPrice = useMemo(() => {
        if (!globalState || !marketCurrency || !quoteCurrency) return undefined;

        const [sqrtPriceX96, tick] = globalState;
        if (sqrtPriceX96 === 0n) return undefined;

        try {
            // Use tickToPrice for accurate conversion
            const price = tickToPrice(marketCurrency.wrapped, quoteCurrency.wrapped, Number(tick));
            return parseFloat(price.toSignificant(8));
        } catch {
            return undefined;
        }
    }, [globalState, marketCurrency, quoteCurrency]);

    // Update price history when price changes
    useEffect(() => {
        if (currentPrice === undefined) return;

        const now = Math.floor(Date.now() / 1000);
        const tick = globalState ? Number(globalState[1]) : null;

        // Always add a point, even if price hasn't changed (for smooth chart)
        setPriceHistory((prev) => {
            const newPoint = { timestamp: now, price: currentPrice };

            // Keep last 5 minutes of data (300 seconds)
            const cutoff = now - 300;
            const filtered = prev.filter((p) => p.timestamp > cutoff);

            // If this is a new tick value, mark it as a real update
            if (tick !== lastTickRef.current) {
                lastTickRef.current = tick;
            }

            return [...filtered, newPoint];
        });
    }, [currentPrice, globalState]);

    // Initialize with synthetic history on mount
    useEffect(() => {
        if (currentPrice !== undefined && priceHistory.length === 0) {
            const now = Math.floor(Date.now() / 1000);
            // Create initial history with slight variation
            const initialHistory: LivePricePoint[] = [];
            for (let i = 60; i >= 0; i -= 5) {
                initialHistory.push({
                    timestamp: now - i,
                    price: currentPrice,
                });
            }
            setPriceHistory(initialHistory);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPrice]);

    return {
        currentPrice,
        priceHistory,
        isLoading,
    };
}
