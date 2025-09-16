import { usePoolsListQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { voterABI } from "config/abis";
import { VOTER } from "config/contract-addresses";
import { useMemo } from "react";
import { useChainId, useReadContracts } from "wagmi";
import { AlgebraGauge } from "../types/voting";

export function useAllGauges() {
    const chainId = useChainId();
    const { infoClient } = useClients();
    const { data: pools, loading: poolsLoading } = usePoolsListQuery({ client: infoClient });

    const poolsList = useMemo(() => pools?.pools ?? [], [pools]);

    // pools -> gauges
    const { data: gaugesResults, isLoading: gaugesLoading } = useReadContracts({
        contracts: poolsList.map((pool) => ({
            address: VOTER[chainId],
            abi: voterABI,
            functionName: "getGauge",
            args: [pool.id],
        })),
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const gaugeList: AlgebraGauge[] = useMemo(() => gaugesResults?.map((d) => d?.result as AlgebraGauge) ?? [], [gaugesResults]);

    return {
        data: gaugeList,
        isLoading: poolsLoading || gaugesLoading,
    };
}
