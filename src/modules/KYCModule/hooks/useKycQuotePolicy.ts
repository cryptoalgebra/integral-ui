import { usePoolsActiveModules } from "@/hooks/pools/usePoolActiveModules";
import { BoostedRoute, Currency, Route } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { KycQuoteState, KycStatus } from "../types";
import { getRoutePoolAddresses } from "../utils";
import { useKycIdentity } from "./useKycIdentity";

const KYC_MODULE_NAME = "KYC Plugin";

interface KycQuotePolicyParams {
    normalRoutes: Route<Currency, Currency>[];
    boostedRoutes: BoostedRoute<Currency, Currency>[];
}

type CandidateRoute = Route<Currency, Currency> | BoostedRoute<Currency, Currency>;

function routeUsesKycPool(route: CandidateRoute, kycPools: Set<string>): boolean {
    return getRoutePoolAddresses(route).some((poolAddress) => kycPools.has(poolAddress.toLowerCase()));
}

export function useKycQuotePolicy({ normalRoutes, boostedRoutes }: KycQuotePolicyParams) {
    const { address: account } = useAccount();
    const allRoutes = useMemo(() => [...boostedRoutes, ...normalRoutes], [boostedRoutes, normalRoutes]);
    const poolAddresses = useMemo(
        () => [...new Set(allRoutes.flatMap(getRoutePoolAddresses).map((address) => address.toLowerCase()))] as Address[],
        [allRoutes],
    );

    const { activeModulesByPool, isLoading, isError, refetch } = usePoolsActiveModules(poolAddresses);
    const requiredPoolAddresses = useMemo(
        () => poolAddresses.filter((poolAddress) => activeModulesByPool[poolAddress]?.includes(KYC_MODULE_NAME)),
        [activeModulesByPool, poolAddresses],
    );
    const kycPools = useMemo(
        () => new Set(requiredPoolAddresses.map((address) => address.toLowerCase())),
        [requiredPoolAddresses],
    );
    const hasKycRoutes = useMemo(() => allRoutes.some((route) => routeUsesKycPool(route, kycPools)), [allRoutes, kycPools]);
    const identity = useKycIdentity(hasKycRoutes);
    const isVerified = Boolean(account && identity.status === KycStatus.VERIFIED);
    const canQuote = !isLoading && !isError;

    const allowedBoostedRoutes = useMemo(
        () => (canQuote ? boostedRoutes.filter((route) => isVerified || !routeUsesKycPool(route, kycPools)) : []),
        [boostedRoutes, canQuote, isVerified, kycPools],
    );
    const allowedNormalRoutes = useMemo(
        () => (canQuote ? normalRoutes.filter((route) => isVerified || !routeUsesKycPool(route, kycPools)) : []),
        [canQuote, isVerified, kycPools, normalRoutes],
    );

    const kycQuoteState = useMemo<KycQuoteState>(
        () => ({
            hasKycRoutes,
            hasLockedKycRoutes: hasKycRoutes && !isVerified,
            requiredPoolAddresses,
            isLoading,
            isError,
            refetch: async () => {
                await refetch();
                return identity.refetch();
            },
        }),
        [hasKycRoutes, identity, isError, isLoading, isVerified, refetch, requiredPoolAddresses],
    );

    return {
        normalRoutes: allowedNormalRoutes,
        boostedRoutes: allowedBoostedRoutes,
        kycQuoteState,
    };
}
