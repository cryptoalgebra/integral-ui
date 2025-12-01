import { useAccount } from "wagmi";
import { useClients } from "../graphql/useClients";
import { TokenFieldsFragment, useActiveFarmingsQuery, usePoolsListQuery } from "@/graphql/generated/graphql";
import { POOL_MAX_APR_API, fetcher, POOL_AVG_APR_API, ETERNAL_FARMINGS_API } from "config/apr-urls";
import { useMemo } from "react";
import useSWR from "swr";
import { usePositions } from "../positions/usePositions";

import ALMModule from "@/modules/ALMModule";
import { Address } from "viem";
import { BOOSTED_TOKENS } from "config/tokens";
import { DEFAULT_CHAIN_ID } from "config";
const { useAllUserALMAmounts, useAllALMVaults } = ALMModule.hooks;

interface Pair {
    token0: TokenFieldsFragment;
    token1: TokenFieldsFragment;
}

export interface FormattedPool {
    id: Address;
    pair: Pair;
    fee: number;
    tvlUSD: number;
    volume24USD: number;
    poolMaxApr: number;
    poolAvgApr: number;
    avgApr: number;
    farmApr: number;
    isMyPool: boolean;
    hasActiveFarming: boolean;
    hasALM: boolean;
    deployer: string;
    isBoostedPool: boolean;
    isBoostedToken0: boolean;
    isBoostedToken1: boolean;
}

export function useFormattedPools(tokenAddress?: Address): { pools: FormattedPool[]; isLoading: boolean } {
    const { address: account, chainId } = useAccount();

    const { infoClient, farmingClient } = useClients();

    const { data: pools, loading: isPoolsListLoading } = usePoolsListQuery({
        client: infoClient,
    });

    const { data: activeFarmings, loading: isFarmingsLoading } = useActiveFarmingsQuery({
        client: farmingClient,
    });
    const { positions, loading: isPositionsLoading } = usePositions();

    const { data: almPositions } = useAllUserALMAmounts(account);
    const { data: almVaults } = useAllALMVaults();

    const { data: poolsMaxApr, isLoading: isPoolsMaxAprLoading } = useSWR(POOL_MAX_APR_API, fetcher);
    const { data: poolsAvgApr, isLoading: isPoolsAvgAprLoading } = useSWR(POOL_AVG_APR_API, fetcher);
    const { data: farmingsAPR, isLoading: isFarmingsAPRLoading } = useSWR(ETERNAL_FARMINGS_API, fetcher);

    const isLoading =
        isPoolsListLoading ||
        isPoolsMaxAprLoading ||
        isPoolsAvgAprLoading ||
        isPositionsLoading ||
        isFarmingsLoading ||
        isFarmingsAPRLoading;

    const formattedPools = useMemo(() => {
        if (isLoading || !pools) return [];

        return pools.pools
            .filter((pool) => {
                if (tokenAddress) {
                    return (
                        pool.token0.id.toLowerCase() === tokenAddress.toLowerCase() ||
                        pool.token1.id.toLowerCase() === tokenAddress.toLowerCase()
                    );
                }
                return true;
            })
            .map(({ id, token0, token1, fee, totalValueLockedUSD, deployer, poolDayData }) => {
                const currentPool = poolDayData[0];
                const lastDate = currentPool ? currentPool.date * 1000 : 0;
                const currentDate = new Date().getTime();

                /* time difference calculations here to ensure that the graph provides information for the last 24 hours */
                const timeDifference = currentDate - lastDate;
                const msIn24Hours = 24 * 60 * 60 * 1000;

                const openPositions = positions?.filter(
                    (position) => position.pool.toLowerCase() === id.toLowerCase() && position.liquidity > 0n
                );
                const activeFarming = activeFarmings?.eternalFarmings.find((farming) => farming.pool === id);

                const openVaults = almVaults?.filter((vault) => vault.pool === id.toLowerCase());
                const openAlmPositions = almPositions?.filter((position) => position.poolAddress.toLowerCase() === id.toLowerCase());

                const poolMaxApr = poolsMaxApr && poolsMaxApr[id] ? Number(poolsMaxApr[id].toFixed(2)) : 0;
                const poolAvgApr = poolsAvgApr && poolsAvgApr[id] ? Number(poolsAvgApr[id].toFixed(2)) : 0;
                const farmApr = activeFarming && farmingsAPR && farmingsAPR[activeFarming.id] > 0 ? farmingsAPR[activeFarming.id] : 0;

                const avgApr = farmApr + poolAvgApr;

                const isBoostedToken0 = Object.values(BOOSTED_TOKENS[chainId || DEFAULT_CHAIN_ID]).find(
                    (bt) => bt.address.toLowerCase() === token0.id.toLowerCase()
                );
                const isBoostedToken1 = Object.values(BOOSTED_TOKENS[chainId || DEFAULT_CHAIN_ID]).find(
                    (bt) => bt.address.toLowerCase() === token1.id.toLowerCase()
                );
                const isBoosted = isBoostedToken0 || isBoostedToken1;

                return {
                    id: id as Address,
                    pair: {
                        token0,
                        token1,
                    },
                    fee: Number(fee) / 10_000,
                    tvlUSD: Number(totalValueLockedUSD),
                    volume24USD: timeDifference <= msIn24Hours ? Number(currentPool.volumeUSD) : 0,
                    fees24USD: timeDifference <= msIn24Hours ? Number(currentPool.feesUSD) : 0,
                    poolMaxApr,
                    poolAvgApr,
                    farmApr,
                    avgApr,
                    isMyPool: Boolean(openPositions?.length || openAlmPositions?.length),
                    hasALM: Boolean(openVaults?.length),
                    hasActiveFarming: Boolean(activeFarming),
                    isBoostedPool: Boolean(isBoosted),
                    isBoostedToken0: Boolean(isBoostedToken0),
                    isBoostedToken1: Boolean(isBoostedToken1),
                    deployer: deployer.toLowerCase(),
                };
            });
    }, [
        isLoading,
        pools,
        tokenAddress,
        positions,
        activeFarmings?.eternalFarmings,
        almVaults,
        almPositions,
        poolsMaxApr,
        poolsAvgApr,
        farmingsAPR,
    ]);

    return { pools: formattedPools, isLoading };
}
