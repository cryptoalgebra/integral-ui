import { useMemo } from "react";
import { Address } from "viem";
import { useClients } from "../graphql/useClients";
import { usePoolAprQuery } from "@/graphql/generated/graphql";

export function usePoolAPR(poolId: Address | undefined) {
    const { infoClient } = useClients();

    const { data, loading } = usePoolAprQuery({
        client: infoClient,
        variables: {
            poolId: poolId as string,
        },
        skip: !poolId,
    });

    return useMemo(() => {
        if (loading || !data?.pool) return undefined;

        const totalValueLockedUSD = Number(data.pool.totalValueLockedUSD);
        if (!Number.isFinite(totalValueLockedUSD) || totalValueLockedUSD <= 0) return 0;

        const latestDayData = data.pool.poolDayData?.[0];
        if (!latestDayData) return 0;

        const lastDateMs = latestDayData.date * 1000;
        const msIn24Hours = 24 * 60 * 60 * 1000;
        const fees24H = Date.now() - lastDateMs <= msIn24Hours ? Number(latestDayData.feesUSD) : 0;

        if (!Number.isFinite(fees24H) || fees24H <= 0) return 0;
        return (fees24H / totalValueLockedUSD) * 100;
    }, [data, loading]);
}
