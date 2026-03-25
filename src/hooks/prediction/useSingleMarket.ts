import { Address } from "viem"
import { useClients } from "../graphql/useClients"
import { useSingleMarketQuery } from "@/graphql/generated/graphql"
import { useMemo } from "react"
import { MarketCondition, PredictionMarket } from "@/types/prediction"

export function useSingleMarket(id: Address | undefined) {

    const { predictionClient } = useClients()

    const { data, loading, error } = useSingleMarketQuery({
        client: predictionClient,
        variables: {
            market: id || ''
        },
        skip: id === undefined,
    })

    const formattedData = useMemo(() => {

        if (!data?.market) return undefined;

        const market = data.market

        return {
            ...market,
            id: market.id as Address,
            collateralToken: market.collateralToken as Address,
            marketToken: Number(market.marketToken),
            condition: market.condition as MarketCondition,
        } as PredictionMarket;

    }, [data])

    return {
        data: formattedData,
        loading,
        error
    }

}