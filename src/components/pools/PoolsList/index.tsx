import { poolsColumns } from "@/components/common/Table/poolsColumns";
import { useActiveFarmingsQuery, usePoolsListQuery } from "@/graphql/generated/graphql";
import { useMemo } from "react";
import { Address } from "viem";
import { ETERNAL_FARMINGS_API, POOL_AVG_APR_API, POOL_MAX_APR_API, fetcher } from "config";
import useSWR from "swr";
import PoolsTable from "@/components/common/Table/poolsTable";
import { usePositions } from "@/hooks/positions/usePositions";
import { useClients } from "@/hooks/graphql/useClients";
import { useAccount } from "wagmi";

import ALMModule from "@/modules/ALMModule";
const { useAllUserALMAmounts, useAllALMVaults } = ALMModule.hooks;

const PoolsList = ({ isExplore = false, tokenId }: { isExplore?: boolean; tokenId?: Address }) => {
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
                if (tokenId) {
                    return pool.token0.id.toLowerCase() === tokenId.toLowerCase() || pool.token1.id.toLowerCase() === tokenId.toLowerCase();
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
                    deployer: deployer.toLowerCase(),
                };
            });
    }, [
        isLoading,
        pools,
        tokenId,
        positions,
        activeFarmings?.eternalFarmings,
        almVaults,
        almPositions,
        poolsMaxApr,
        poolsAvgApr,
        farmingsAPR,
    ]);

    return (
        <div className="flex flex-col gap-4">
            <PoolsTable
                columns={poolsColumns}
                data={formattedPools}
                defaultSortingID={"tvlUSD"}
                link={isExplore ? "analytics/pools" : "pool"}
                showPagination={true}
                loading={isLoading}
            />
        </div>
    );
};

export default PoolsList;
