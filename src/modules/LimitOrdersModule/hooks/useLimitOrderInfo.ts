import { usePool } from "@/hooks/pools/usePool";
import { Currency, CurrencyAmount, Position, ZERO } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { Address } from "viem";

export function useLimitOrderInfo(
    poolAddress: Address | undefined,
    amount: CurrencyAmount<Currency> | undefined,
    limitOrderTick: number | undefined
) {
    const [, pool] = usePool(poolAddress);

    return useMemo(() => {
        if (!amount || !pool || typeof limitOrderTick !== "number") return undefined;

        const amount0 = amount.currency.wrapped.equals(pool.token0) ? amount.quotient : ZERO;
        const amount1 = amount.currency.wrapped.equals(pool.token1) ? amount.quotient : ZERO;

        if (amount0 !== undefined && amount1 !== undefined) {
            return Position.fromAmounts({
                pool,
                tickLower: limitOrderTick,
                tickUpper: limitOrderTick + 60,
                amount0,
                amount1,
                useFullPrecision: true,
            });
        } else {
            return undefined;
        }
    }, [limitOrderTick, amount]);
}
