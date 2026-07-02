import { Currency, Route, BoostedRoute } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { useSwapPools } from "./useSwapPools";
import { computeBoostedRoutes } from "@/utils/swap/computeBoostedRoutes";
import { computeRegularRoutes } from "@/utils/swap/computeRegularRoutes";

export function useAllRoutes(
    currencyIn?: Currency,
    currencyOut?: Currency,
): {
    loading: boolean;
    boostedRoutes: BoostedRoute<Currency, Currency>[];
    normalRoutes: Route<Currency, Currency>[];
} {
    const { pools, isLoading: poolsLoading } = useSwapPools(currencyIn, currencyOut);

    const { normalRoutes, boostedRoutes } = useMemo(() => {
        if (poolsLoading || !currencyIn || !currencyOut)
            return {
                normalRoutes: [],
                boostedRoutes: [],
            };

        const normalRoutes = computeRegularRoutes(currencyIn, currencyOut, pools);
        const boostedRoutes = computeBoostedRoutes(currencyIn, currencyOut, pools);

        return { normalRoutes, boostedRoutes };
    }, [currencyIn, currencyOut, pools, poolsLoading]);

    return {
        normalRoutes: normalRoutes.length > 1 ? [normalRoutes?.[1]] : [],
        boostedRoutes,
        loading: poolsLoading,
    };
}
