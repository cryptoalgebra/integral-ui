import { useOpenMarketsByTokensListQuery } from "@/graphql/generated/graphql";
import { Address } from "viem";
import { useClients } from "../graphql/useClients";
import { useMemo } from "react";
import { MarketCondition, PredictionMarket } from "@/types/prediction";

export function useMarketsByTokens(token0: Address | undefined, token1: Address | undefined) {

    const { predictionClient } = useClients()

    const { data, loading, error } = useOpenMarketsByTokensListQuery({
        variables: {
            token0,
            token1
        },
        client: predictionClient,
        skip: token0 === undefined && token1 === undefined
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