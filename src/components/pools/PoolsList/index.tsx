import DataTable from '@/components/common/Table/dataTable';
import { poolsColumns } from '@/components/common/Table/poolsColumns';
import { usePoolsListQuery } from '@/graphql/generated/graphql';
import { useMemo } from 'react';
import { Address } from 'viem';
import { POOL_AVG_APR_API, POOL_MAX_APR_API, fetcher } from '@/constants/api';
import useSWR from 'swr';

const PoolsList = () => {
    const { data: pools, loading } = usePoolsListQuery();

    const { data: poolsMaxApr } = useSWR(POOL_MAX_APR_API, fetcher);
    const { data: poolsAvgApr } = useSWR(POOL_AVG_APR_API, fetcher);

    const formattedPools = useMemo(() => {
        if (!pools?.pools || !poolsMaxApr || !poolsAvgApr) return [];

        return pools.pools.map(
            ({ id, token0, token1, fee, totalValueLockedUSD, volumeUSD }) => ({
                id: id as Address,
                pair: {
                    token0,
                    token1,
                },
                fee: Number(fee) / 10_000,
                tvlUSD: Number(totalValueLockedUSD),
                volume24USD: Number(volumeUSD),
                maxApr: poolsMaxApr[id].toFixed(2),
                avgApr: poolsAvgApr[id].toFixed(2),
            })
        );
    }, [pools, poolsMaxApr, poolsAvgApr]);

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
