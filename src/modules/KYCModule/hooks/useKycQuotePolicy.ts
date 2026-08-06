import { BoostedRoute, Currency, Route } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { Address } from "viem";
import { KycQuoteState } from "../types";
import { getRoutePoolAddresses } from "../utils";
import { usePoolsPermissions } from "./usePoolsPermissions";

interface KycQuotePolicyParams {
    normalRoutes: Route<Currency, Currency>[];
    boostedRoutes: BoostedRoute<Currency, Currency>[];
}

type CandidateRoute = Route<Currency, Currency> | BoostedRoute<Currency, Currency>;

function routeUsesPermissionedPool(route: CandidateRoute, permissionedPools: Set<string>): boolean {
    return getRoutePoolAddresses(route).some((poolAddress) => permissionedPools.has(poolAddress.toLowerCase()));
}

function canQuoteRoute(route: CandidateRoute, canSwapByPool: Record<string, boolean>): boolean {
    return getRoutePoolAddresses(route).every((poolAddress) => canSwapByPool[poolAddress.toLowerCase()] !== false);
}

export function useKycQuotePolicy({ normalRoutes, boostedRoutes }: KycQuotePolicyParams) {
    const allRoutes = useMemo(() => [...boostedRoutes, ...normalRoutes], [boostedRoutes, normalRoutes]);
    const poolAddresses = useMemo(
        () => [...new Set(allRoutes.flatMap(getRoutePoolAddresses).map((address) => address.toLowerCase()))] as Address[],
        [allRoutes],
    );

    const { permissionsByPool, isLoading, isError, refetch } = usePoolsPermissions(poolAddresses);
    const requiredPoolAddresses = useMemo(
        () => poolAddresses.filter((poolAddress) => permissionsByPool[poolAddress]?.isPermissioned),
        [permissionsByPool, poolAddresses],
    );
    const permissionedPools = useMemo(
        () => new Set(requiredPoolAddresses.map((address) => address.toLowerCase())),
        [requiredPoolAddresses],
    );
    const canSwapByPool = useMemo(
        () =>
            Object.fromEntries(
                poolAddresses.map((poolAddress) => [poolAddress, permissionsByPool[poolAddress]?.canSwap ?? true]),
            ),
        [permissionsByPool, poolAddresses],
    );
    const hasKycRoutes = useMemo(
        () => allRoutes.some((route) => routeUsesPermissionedPool(route, permissionedPools)),
        [allRoutes, permissionedPools],
    );
    const hasLockedKycRoutes = useMemo(
        () =>
            allRoutes.some(
                (route) => routeUsesPermissionedPool(route, permissionedPools) && !canQuoteRoute(route, canSwapByPool),
            ),
        [allRoutes, canSwapByPool, permissionedPools],
    );
    const canQuote = !isLoading && !isError;

    const allowedBoostedRoutes = useMemo(
        () => (canQuote ? boostedRoutes.filter((route) => canQuoteRoute(route, canSwapByPool)) : []),
        [boostedRoutes, canQuote, canSwapByPool],
    );
    const allowedNormalRoutes = useMemo(
        () => (canQuote ? normalRoutes.filter((route) => canQuoteRoute(route, canSwapByPool)) : []),
        [canQuote, canSwapByPool, normalRoutes],
    );

    const kycQuoteState = useMemo<KycQuoteState>(
        () => ({
            hasKycRoutes,
            hasLockedKycRoutes,
            requiredPoolAddresses,
            isLoading,
            isError,
            refetch,
        }),
        [hasKycRoutes, hasLockedKycRoutes, isError, isLoading, refetch, requiredPoolAddresses],
    );

    return {
        normalRoutes: allowedNormalRoutes,
        boostedRoutes: allowedBoostedRoutes,
        kycQuoteState,
    };
}
