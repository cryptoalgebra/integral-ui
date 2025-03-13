import { poolsColumns } from "@/components/common/Table/poolsColumns";
import { useMemo } from "react";
import { Address } from "viem";
import PoolsTable from "@/components/common/Table/poolsTable";
import { usePool } from "@/hooks/pools/usePool";

export const tacPools = ["0xF0e844De4480c214752ba137F56e2A3bD0d9c221"];

const PoolsList = () => {
    // const { data: pools, loading: isPoolsListLoading } = usePoolsListQuery();

    // const { data: activeFarmings, loading: isFarmingsLoading } = useActiveFarmingsQuery({
    //     client: farmingClient,
    // });
    // const { positions, loading: isPositionsLoading } = usePositions();

    // const { data: poolsMaxApr, isLoading: isPoolsMaxAprLoading } = useSWR(POOL_MAX_APR_API, fetcher);
    // const { data: poolsAvgApr, isLoading: isPoolsAvgAprLoading } = useSWR(POOL_AVG_APR_API, fetcher);
    // const { data: farmingsAPR, isLoading: isFarmingsAPRLoading } = useSWR(ETERNAL_FARMINGS_API, fetcher);

    // const isLoading =
    //     isPoolsListLoading ||
    //     isPoolsMaxAprLoading ||
    //     isPoolsAvgAprLoading ||
    //     isPositionsLoading ||
    //     isFarmingsLoading ||
    //     isFarmingsAPRLoading;

    // const formattedPools = useMemo(() => {
    //     if (isLoading || !pools) return [];

    //     return pools.pools.map(({ id, token0, token1, fee, totalValueLockedUSD, poolDayData }) => {
    //         const currentPool = poolDayData[0];
    //         const lastDate = currentPool ? currentPool.date * 1000 : 0;
    //         const currentDate = new Date().getTime();

    //         /* time difference calculations here to ensure that the graph provides information for the last 24 hours */
    //         const timeDifference = currentDate - lastDate;
    //         const msIn24Hours = 24 * 60 * 60 * 1000;

    //         const openPositions = positions?.filter((position) => position.pool.toLowerCase() === id.toLowerCase());
    //         const activeFarming = activeFarmings?.eternalFarmings.find((farming) => farming.pool === id);

    //         const poolMaxApr = poolsMaxApr && poolsMaxApr[id] ? Number(poolsMaxApr[id].toFixed(2)) : 0;
    //         const poolAvgApr = poolsAvgApr && poolsAvgApr[id] ? Number(poolsAvgApr[id].toFixed(2)) : 0;
    //         const farmApr = activeFarming && farmingsAPR && farmingsAPR[activeFarming.id] > 0 ? farmingsAPR[activeFarming.id] : 0;

    //         const avgApr = farmApr + poolAvgApr;

    //         return {
    //             id: id as Address,
    //             pair: {
    //                 token0,
    //                 token1,
    //             },
    //             fee: Number(fee) / 10_000,
    //             tvlUSD: Number(totalValueLockedUSD),
    //             volume24USD: timeDifference <= msIn24Hours ? currentPool.volumeUSD : 0,
    //             fees24USD: timeDifference <= msIn24Hours ? currentPool.feesUSD : 0,
    //             poolMaxApr,
    //             poolAvgApr,
    //             farmApr,
    //             avgApr,
    //             isMyPool: Boolean(openPositions?.length),
    //             hasActiveFarming: Boolean(activeFarming),
    //         };
    //     });
    // }, [isLoading, pools, positions, activeFarmings, poolsMaxApr, poolsAvgApr, farmingsAPR]);
    const [, pool] = usePool(tacPools[0] as Address);

    const formattedPools = useMemo(() => {
        if (!pool) return [];
        const tvlUSD = Number(pool.liquidity.toString()) / 10 ** 9;
        const volume24USD = tvlUSD / pool.tickCurrent;
        const fees24USD = volume24USD / pool.tickCurrent;

        return [
            {
                id: tacPools[0] as Address,
                pair: {
                    token0: {
                        ...pool.token0,
                        id: pool.token0.address,
                        derivedMatic: 0,
                        symbol: pool.token0.symbol as string,
                        name: pool.token0.name as string,
                    },
                    token1: {
                        ...pool.token1,
                        id: pool.token1.address,
                        derivedMatic: 0,
                        symbol: pool.token1.symbol as string,
                        name: pool.token1.name as string,
                    },
                },
                fee: Number(pool.fee) / 10_000,
                tvlUSD,
                volume24USD,
                fees24USD,
                poolMaxApr: 0,
                poolAvgApr: 0,
                farmApr: 0,
                avgApr: 0,
                isMyPool: false,
                hasActiveFarming: false,
            },
        ];
    }, [pool]);

    return (
        <div className="flex flex-col gap-4">
            <PoolsTable
                columns={poolsColumns}
                data={formattedPools}
                defaultSortingID={"tvlUSD"}
                link={"pool"}
                showPagination={true}
                loading={!pool}
            />
        </div>
    );
};

export default PoolsList;
