import { Currency, Route, BoostedRoute } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { useSwapPools } from "./useSwapPools";
import { useChainId } from "wagmi";
import { computeBoostedRoutes } from "@/utils/swap/computeBoostedRoutes";
import { computeRegularRoutes } from "@/utils/swap/computeRegularRoutes";

export function useAllRoutes(
    currencyIn?: Currency,
    currencyOut?: Currency
): {
    loading: boolean;
    boostedRoutes: BoostedRoute<Currency, Currency>[];
    normalRoutes: Route<Currency, Currency>[];
} {
    const chainId = useChainId();
    const { pools, isLoading: poolsLoading } = useSwapPools(currencyIn, currencyOut);

    const { normalRoutes, boostedRoutes } = useMemo(() => {
        if (poolsLoading || !chainId || !pools || !currencyIn || !currencyOut)
            return {
                normalRoutes: [],
                boostedRoutes: [],
            };

        return {
            normalRoutes: computeRegularRoutes(currencyIn, currencyOut, pools),
            boostedRoutes: computeBoostedRoutes(currencyIn, currencyOut, pools),
        };
    }, [chainId, currencyIn, currencyOut, pools, poolsLoading]);

    if (normalRoutes.length || boostedRoutes.length) {
        console.log("[COMPUTED ROUTES]", { normalRoutes, boostedRoutes });
    }

    return {
        normalRoutes,
        boostedRoutes,
        loading: poolsLoading,
    };
}
