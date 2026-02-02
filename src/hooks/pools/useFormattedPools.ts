import { useAccount } from "wagmi";
import { useClients } from "../graphql/useClients";
import { useActiveFarmingsQuery, usePoolsListQuery } from "@/graphql/generated/graphql";
import { useMemo } from "react";
import { usePositions } from "../positions/usePositions";

import ALMModule from "@/modules/ALMModule";
import { Address } from "viem";
const { useAllUserALMAmounts, useAllALMVaults } = ALMModule.hooks;

export function useFormattedPools(tokenAddress?: Address) {
    const { address: account } = useAccount();

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

    const isLoading =
        isPoolsListLoading ||
        isPositionsLoading ||
        isFarmingsLoading;

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
                    avgApr: Number(currentPool.feesUSD) / Number(totalValueLockedUSD) * 100,
                    isMyPool: Boolean(openPositions?.length || openAlmPositions?.length),
                    hasALM: Boolean(openVaults?.length),
                    hasActiveFarming: Boolean(activeFarming),
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
    ]);

    return { pools: formattedPools, isLoading };
}
