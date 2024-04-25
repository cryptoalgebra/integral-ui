import { poolsColumns } from "@/components/common/Table/poolsColumns";
import { useAllFarmingsQuery, usePoolsListQuery, usePoolsVolumeDataQuery } from "@/graphql/generated/graphql";
import { useMemo } from "react";
import { Address } from "viem";
import { POOL_AVG_APR_API, POOL_MAX_APR_API, fetcher } from "@/constants/api";
import useSWR from "swr";
import PoolsTable from "@/components/common/Table/poolsTable";
import { usePositions } from "@/hooks/positions/usePositions";
import { farmingClient } from "@/graphql/clients";

const PoolsList = () => {
    const { data: pools, loading: isPoolsListLoading } = usePoolsListQuery();

    const { data: poolsVolume, loading: isPoolsVolumeLoading } = usePoolsVolumeDataQuery();

    const { data: poolsMaxApr, isLoading: isPoolsMaxAprLoading } = useSWR(POOL_MAX_APR_API, fetcher);
    const { data: poolsAvgApr, isLoading: isPoolsAvgAprLoading } = useSWR(POOL_AVG_APR_API, fetcher);
    
    const { data: activeFarmings, loading: isFarmingsLoading } = useAllFarmingsQuery({
        client: farmingClient
    })

    const { positions, loading: isPositionsLoading } = usePositions();

    const isLoading = isPoolsListLoading || isPoolsVolumeLoading || isPoolsMaxAprLoading || isPoolsAvgAprLoading || isPositionsLoading || isFarmingsLoading;

    const formattedPools = useMemo(() => {
        if (isLoading || !pools || !poolsVolume || !positions) return [];

        return pools.pools.map(({ id, token0, token1, fee, totalValueLockedUSD }) => {
            const currentPool = poolsVolume.poolDayDatas.find((currPool) => currPool.pool.id === id);
            const lastDate = currentPool ? currentPool.date * 1000 : 0;
            const currentDate = new Date().getTime();

            const timeDifference = currentDate - lastDate;
            const msIn24Hours = 24 * 60 * 60 * 1000;

            const openPositions = positions.filter((position) => position.pool.toLowerCase() === id.toLowerCase());

            const hasActiveFarming = activeFarmings?.eternalFarmings.some((farming) => farming.pool === id);

            return {
                id: id as Address,
                pair: {
                    token0,
                    token1,
                },
                fee: Number(fee) / 10_000,
                tvlUSD: Number(totalValueLockedUSD),
                volume24USD: timeDifference <= msIn24Hours && currentPool ? currentPool.volumeUSD : 0,
                maxApr: poolsMaxApr[id] ? poolsMaxApr[id].toFixed(2) : 0,
                avgApr: poolsAvgApr[id] ? poolsAvgApr[id].toFixed(2) : 0,
                isMyPool: openPositions?.length > 0,
                hasActiveFarming,
            };
        });
    }, [pools, poolsMaxApr, poolsAvgApr, poolsVolume, positions, activeFarmings]);

    return (
        <div className="flex flex-col gap-4">
            <PoolsTable
                columns={poolsColumns}
                data={formattedPools}
                defaultSortingID={"tvlUSD"}
                link={"pool"}
                showPagination={true}
                loading={isLoading}
            />
        </div>
    );
};

export default PoolsList;
