import DataTable from '@/components/common/Table/dataTable';
import { poolsColumns } from '@/components/common/Table/poolsColumns';
import {
    usePoolsListQuery,
    usePoolsVolumeDataQuery,
} from '@/graphql/generated/graphql';
import { useMemo } from 'react';
import { Address } from 'viem';
import { POOL_AVG_APR_API, POOL_MAX_APR_API, fetcher } from '@/constants/api';
import useSWR from 'swr';

const PoolsList = () => {
    const { data: pools, loading } = usePoolsListQuery();

    const { data: poolsVolume } = usePoolsVolumeDataQuery();

    const { data: poolsMaxApr } = useSWR(POOL_MAX_APR_API, fetcher);
    const { data: poolsAvgApr } = useSWR(POOL_AVG_APR_API, fetcher);

    const formattedPools = useMemo(() => {
        if (
            !pools?.pools ||
            !poolsMaxApr ||
            !poolsAvgApr ||
            !poolsVolume?.poolDayDatas
        )
            return [];

        return pools.pools.map(
            ({ id, token0, token1, fee, totalValueLockedUSD }) => {
                const currentPool = poolsVolume.poolDayDatas.find(
                    (currPool) => currPool.pool.id === id
                );
                return {
                    id: id as Address,
                    pair: {
                        token0,
                        token1,
                    },
                    fee: Number(fee) / 10_000,
                    tvlUSD: Number(totalValueLockedUSD),
                    volume24USD: Number(currentPool?.volumeUSD),
                    maxApr: poolsMaxApr[id] ? poolsMaxApr[id].toFixed(2) : 0,
                    avgApr: poolsAvgApr[id] ? poolsAvgApr[id].toFixed(2) : 0,
                };
            }
        );
    }, [pools, poolsMaxApr, poolsAvgApr, poolsVolume]);

    return (
        <div className="flex flex-col gap-4">
            <DataTable
                columns={poolsColumns}
                data={formattedPools}
                defaultSortingID={'tvlUSD'}
                link={'pool'}
                showPagination={false}
                loading={loading}
            />
        </div>
    );
};

export default PoolsList;
