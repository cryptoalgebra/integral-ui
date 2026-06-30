import { usePoolDayDatasQuery, useSinglePoolQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { getPoolAPR } from "@/utils/pool/getPoolAPR";
import { useMemo } from "react";
import useSWR from "swr";
import { Address } from "viem";

export interface PoolStats {
    fee: number;
    tvlUSD: number;
    volume24USD: number;
    fees24USD: number;
    avgApr: number;
    isLoading: boolean;
}

export function usePoolStats(poolId: Address): PoolStats {
    const { infoClient } = useClients();

    const poolDayDataRange = useMemo(() => {
        const to = Math.floor(Date.now() / 1000);
        const from = to - 3 * 24 * 60 * 60;

        return { from, to };
    }, []);

    const { data: poolInfoData, loading: isPoolInfoLoading } = useSinglePoolQuery({
        client: infoClient,
        variables: { poolId: poolId.toLowerCase() },
    });

    const { data: poolDayData, loading: isPoolDayDataLoading } = usePoolDayDatasQuery({
        client: infoClient,
        variables: {
            poolId: poolId.toLowerCase(),
            from: poolDayDataRange.from,
            to: poolDayDataRange.to,
        },
    });

    const { data: poolAvgApr, isLoading: isPoolAprLoading } = useSWR(["poolAPR", poolId], () => getPoolAPR(poolId));

    return useMemo(() => {
        const latestDayData = poolDayData?.poolDayDatas?.at(-1);
        const latestDayDataDate = latestDayData ? latestDayData.date * 1000 : 0;
        const isLatestDayDataFresh = Date.now() - latestDayDataDate <= 24 * 60 * 60 * 1000;

        return {
            fee: Number(poolInfoData?.pool?.overrideFee || 0) / 10_000,
            tvlUSD: Number(poolInfoData?.pool?.totalValueLockedUSD || 0),
            volume24USD: isLatestDayDataFresh ? Number(latestDayData?.volumeUSD || 0) : 0,
            fees24USD: isLatestDayDataFresh ? Number(latestDayData?.feesUSD || 0) : 0,
            avgApr: Number(poolAvgApr || 0),
            isLoading: isPoolInfoLoading || isPoolDayDataLoading || isPoolAprLoading,
        };
    }, [isPoolAprLoading, isPoolDayDataLoading, isPoolInfoLoading, poolAvgApr, poolDayData?.poolDayDatas, poolInfoData?.pool]);
}
