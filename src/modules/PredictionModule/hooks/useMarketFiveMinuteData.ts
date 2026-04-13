import { Address } from "viem";
import { useClients } from "../../../hooks/graphql/useClients";
import { useMarketFiveMinuteDataQuery } from "@/graphql/generated/graphql";
import { useMemo } from "react";
import { PredictionMarket } from "@/modules/PredictionModule/types/prediction";

export function useMarketFiveMinuteData(id: Address | undefined) {
    const { predictionClient } = useClients();

    const { data, loading, error } = useMarketFiveMinuteDataQuery({
        client: predictionClient,
        variables: {
            market: id,
        },
        skip: id === undefined,
        pollInterval: 60_000 * 5,
    });

    const formattedData = useMemo(() => {
        if (!data) return [];

        return data.marketFiveMinuteDatas.map((data) => ({
            ...data,
            market: {
                ...data.market,
                index: BigInt(data.market.id.split("-")[1]),
            } as PredictionMarket,
        }));
    }, [data]);

    return {
        data: formattedData,
        loading,
        error,
    };
}
