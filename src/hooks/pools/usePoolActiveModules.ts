import { useMultiplePoolsQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { useMemo } from "react";
import { Address } from "viem";

export interface PoolsActiveModulesResult {
    activeModulesByPool: Record<string, readonly string[]>;
    pluginByPool: Record<string, Address | undefined>;
    isLoading: boolean;
    isError: boolean;
    refetch: () => Promise<unknown>;
}

export function usePoolsActiveModules(poolAddresses: Address[]): PoolsActiveModulesResult {
    const { infoClient } = useClients();
    const normalizedPoolAddresses = useMemo(
        () => [...new Set(poolAddresses.map((address) => address.toLowerCase() as Address))],
        [poolAddresses],
    );

    const { data, loading, error, refetch } = useMultiplePoolsQuery({
        client: infoClient,
        variables: { poolIds: normalizedPoolAddresses },
        skip: normalizedPoolAddresses.length === 0,
    });

    const { activeModulesByPool, pluginByPool } = useMemo(() => {
        const activeModulesByPool: Record<string, readonly string[]> = {};
        const pluginByPool: Record<string, Address | undefined> = {};

        for (const poolAddress of normalizedPoolAddresses) {
            activeModulesByPool[poolAddress] = [];
        }

        for (const pool of data?.pools || []) {
            const poolAddress = pool.id.toLowerCase();
            activeModulesByPool[poolAddress] = pool.plugin?.activeModules || [];
            pluginByPool[poolAddress] = pool.plugin?.id as Address | undefined;
        }

        return { activeModulesByPool, pluginByPool };
    }, [data?.pools, normalizedPoolAddresses]);

    return {
        activeModulesByPool,
        pluginByPool,
        isLoading: normalizedPoolAddresses.length > 0 && loading,
        isError: Boolean(error),
        refetch,
    };
}

export function usePoolActiveModules(poolAddress: Address | undefined) {
    const poolAddresses = useMemo(() => (poolAddress ? [poolAddress] : []), [poolAddress]);
    const result = usePoolsActiveModules(poolAddresses);
    const normalizedPoolAddress = poolAddress?.toLowerCase();

    return {
        activeModules: normalizedPoolAddress ? result.activeModulesByPool[normalizedPoolAddress] || [] : [],
        pluginAddress: normalizedPoolAddress ? result.pluginByPool[normalizedPoolAddress] : undefined,
        isLoading: result.isLoading,
        isError: result.isError,
        refetch: result.refetch,
    };
}
