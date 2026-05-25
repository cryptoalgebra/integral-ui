import { Address } from "viem";
import { useClients } from "../../../hooks/graphql/useClients";
import { useSingleMarketQuery } from "@/graphql/generated/graphql";
import { useMemo } from "react";
import { PredictionMarket } from "@/modules/PredictionModule/types/prediction";

export function useSingleMarket(id: Address | undefined) {
    const { predictionClient } = useClients();

    const { data, loading, error, refetch } = useSingleMarketQuery({
        client: predictionClient,
        variables: {
            market: id || "",
        },
        skip: id === undefined,
    });

    const formattedData = useMemo(() => {
        if (!data?.market) return undefined;

        const market = data.market;

        return {
            ...market,
            index: BigInt(market.id.split("-")[1]),
        } as PredictionMarket;
    }, [data]);

    return {
        data: formattedData,
        loading,
        error,
        refetch,
    };
}
