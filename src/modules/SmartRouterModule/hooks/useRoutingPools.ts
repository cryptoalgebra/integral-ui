import { DEFAULT_CHAIN_ID } from "config";
import { useCallback, useMemo } from "react";
import { OnChainProvider, SmartRouter } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { Currency } from "@cryptoalgebra/integral-sdk";

export interface V3PoolsHookParams {
    key?: string;
    blockNumber?: number;
    enabled?: boolean;
}

export interface CommonPoolsParams {
    blockNumber?: number;
    allowInconsistentBlock?: boolean;
    enabled?: boolean;
}

export function useV3CandidatePools(currencyA?: Currency, currencyB?: Currency, options?: V3PoolsHookParams) {
    const chainId = useChainId();
    const key = useMemo(() => {
        if (!currencyA || !currencyB || currencyA.chainId !== currencyB.chainId || currencyA.wrapped.equals(currencyB.wrapped)) {
            return "";
        }
        const symbols = currencyA.wrapped.sortsBefore(currencyB.wrapped)
            ? [currencyA.symbol, currencyB.symbol]
            : [currencyB.symbol, currencyA.symbol];
        return [...symbols, currencyA.chainId].join("_");
    }, [currencyA, currencyB]);

    const refetchInterval = useMemo(() => {
        if (!currencyA?.chainId) {
            return 0;
        }
        return 10_000;
    }, [currencyA?.chainId]);

    const { data, refetch, isLoading, isFetching, error, dataUpdatedAt } = useQuery({
        queryKey: ["v3_candidate_pools", key],
        queryFn: async () => {
            try {
                // console.log(SmartRouter.publicClient[chainId]);
                // console.log(SmartRouter.v3SubgraphClient[chainId]);
                const pools = await SmartRouter.getV3CandidatePools({
                    currencyA,
                    currencyB,
                    onChainProvider: (() => SmartRouter.publicClient[chainId as typeof DEFAULT_CHAIN_ID]) as OnChainProvider,
                    subgraphProvider: () => SmartRouter.v3SubgraphClient[chainId as typeof DEFAULT_CHAIN_ID],
                    // blockNumber: options?.blockNumber,
                });
                console.log("pools", pools);
                return {
                    key,
                    pools,
                    blockNumber: options?.blockNumber,
                };
            } catch (e) {
                console.log(e);
            }
        },
        retry: 2,
        staleTime: refetchInterval,
        refetchInterval,
        refetchOnWindowFocus: false,
        enabled: Boolean(currencyA && currencyB && key && options?.enabled),
    });

    return {
        refresh: refetch,
        pools: data?.pools,
        loading: isLoading,
        syncing: isFetching,
        blockNumber: data?.blockNumber,
        key: data?.key,
        error,
        dataUpdatedAt,
    };
}

export function useCommonPools(
    currencyA?: Currency,
    currencyB?: Currency,
    { blockNumber, allowInconsistentBlock = false, enabled = true }: CommonPoolsParams = {}
) {
    const {
        pools: v3Pools,
        loading: v3Loading,
        syncing: v3Syncing,
        blockNumber: v3BlockNumber,
        refresh: v3Refresh,
        dataUpdatedAt: v3PoolsUpdatedAt,
    } = useV3CandidatePools(currencyA, currencyB, { blockNumber, enabled });

    const poolsData: [any[], number] | undefined = useMemo(
        () =>
            (!v3Loading || v3Pools) && (allowInconsistentBlock || !!v3BlockNumber)
                ? [[...(v3Pools || [])], Math.max(v3PoolsUpdatedAt || 0)]
                : undefined,
        [v3Loading, v3Pools, allowInconsistentBlock, v3BlockNumber, v3PoolsUpdatedAt]
    );

    const refresh = useCallback(async () => {
        return Promise.all([v3Refresh()]);
    }, [v3Refresh]);

    return {
        refresh,
        pools: poolsData?.[0],
        blockNumber: v3BlockNumber,
        loading: v3Loading,
        syncing: v3Syncing,
        dataUpdatedAt: poolsData?.[1],
    };
}
