import { useOpenMarketsForPoolListQuery } from "@/graphql/generated/graphql";
import { Address } from "viem";
import { useClients } from "../graphql/useClients";
import { useMemo } from "react";
import { MarketCondition, PredictionMarket } from "@/types/prediction";

export function usePoolMarkets(pool: Address | undefined) {

    const { predictionClient } = useClients()

    const { data, loading, error } = useOpenMarketsForPoolListQuery({
        variables: {
            pool
        },
        client: predictionClient,
        skip: pool === undefined
    })

    const formattedData = useMemo(() => {
        
        if (!data) return []

        return data.markets.map((market) => ({
            ...market,
            id: market.id as Address,
            collateralToken: market.collateralToken as Address,
            marketToken: Number(market.marketToken),
            condition: market.condition as MarketCondition,
        }))

    }, [data])

    return {
        data: formattedData as PredictionMarket[],
        loading,
        error
    }

}