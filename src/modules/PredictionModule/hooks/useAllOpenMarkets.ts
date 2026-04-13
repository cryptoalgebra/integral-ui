import { useClients } from "../../../hooks/graphql/useClients";
import { useAllOpenMarketsListQuery } from "@/graphql/generated/graphql";
import { useMemo } from "react";
import { PredictionMarket } from "@/modules/PredictionModule/types/prediction";

export function useAllOpenMarkets() {
    const { predictionClient } = useClients();

    const { data, loading, error } = useAllOpenMarketsListQuery({
        client: predictionClient,
        pollInterval: 60_000,
    });

    const formattedData = useMemo(() => {
        if (!data) return [];

        return data.markets
            .map((market) => ({
                ...market,
                index: BigInt(market.id.split("-")[1]),
            }))
            .sort((a, b) => {
                const marketADuration = Number(a.plannedResolutionTimestamp) - Number(a.createdAt);
                const marketBDuration = Number(b.plannedResolutionTimestamp) - Number(b.createdAt);
                return marketADuration - marketBDuration;
            })
            .sort((a, b) => {
                if (b.condition === "greater") return 1;
                return -1;
            });
    }, [data]);

    return {
        data: formattedData as PredictionMarket[],
        loading,
        error,
    };
}
