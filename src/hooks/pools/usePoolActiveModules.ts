import { useMultiplePoolsQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { useMemo } from "react";
import { Address } from "viem";

export interface PoolsActiveModulesResult {
    activeModulesByPool: Record<string, readonly string[]>;
    pluginByPool: Record<string, Address | undefined>;
    tokensByPool: Record<string, readonly [Address, Address] | undefined>;
    isLoading: boolean;
    isError: boolean;
    refetch: () => Promise<unknown>;
}

export function usePoolsActiveModules(poolAddresses: Address[]): PoolsActiveModulesResult {
    const { infoClient } = useClients();
    const normalizedPoolAddresses = useMemo(() => [...new Set(poolAddresses.map((address) => address.toLowerCase() as Address))], [
        poolAddresses,
    ]);

    const { data, loading, error, refetch } = useMultiplePoolsQuery({
        client: infoClient,
        variables: { poolIds: normalizedPoolAddresses },
        skip: normalizedPoolAddresses.length === 0,
    });

    const { activeModulesByPool, pluginByPool, tokensByPool } = useMemo(() => {
        const activeModulesByPool: Record<string, readonly string[]> = {};
        const pluginByPool: Record<string, Address | undefined> = {};
        const tokensByPool: Record<string, readonly [Address, Address] | undefined> = {};

        for (const poolAddress of normalizedPoolAddresses) {
            activeModulesByPool[poolAddress] = [];
        }

        for (const pool of data?.pools || []) {
            const poolAddress = pool.id.toLowerCase();
            activeModulesByPool[poolAddress] = pool.plugin?.activeModules || [];
            pluginByPool[poolAddress] = pool.plugin?.id as Address | undefined;
            tokensByPool[poolAddress] = [pool.token0.id as Address, pool.token1.id as Address];
        }

        return { activeModulesByPool, pluginByPool, tokensByPool };
    }, [data?.pools, normalizedPoolAddresses]);
    const hasMissingPools = Boolean(
        normalizedPoolAddresses.length > 0 &&
            !loading &&
            (!data || normalizedPoolAddresses.some((poolAddress) => !data.pools.some((pool) => pool.id.toLowerCase() === poolAddress))),
    );

    return {
        activeModulesByPool,
        pluginByPool,
        tokensByPool,
        isLoading: normalizedPoolAddresses.length > 0 && loading,
        isError: Boolean(error) || hasMissingPools,
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
        tokens: normalizedPoolAddress ? result.tokensByPool[normalizedPoolAddress] : undefined,
        isLoading: result.isLoading,
        isError: result.isError,
        refetch: result.refetch,
    };
}
