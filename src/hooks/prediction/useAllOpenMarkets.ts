import { Address } from "viem"
import { useClients } from "../graphql/useClients"
import { useAllOpenMarketsListQuery } from "@/graphql/generated/graphql"
import { useMemo } from "react"
import { MarketCondition, PredictionMarket } from "@/types/prediction"

export function useAllOpenMarkets() {

    const { predictionClient } = useClients()

    const { data, loading, error } = useAllOpenMarketsListQuery({
        client: predictionClient
    })

    const formattedData = useMemo(() => {

        if (!data) return []

        return data.markets.map((market) => ({
            ...market,
            id: market.id as Address,
            collateralToken: market.collateralToken as Address,
            marketToken: Number(market.marketToken),
            condition: market.condition as MarketCondition,
        })).sort((a, b) => {
            const marketADuration = Number(a.plannedResolutionTimestamp) - Number(a.createdAt)
            const marketBDuration = Number(b.plannedResolutionTimestamp) - Number(b.createdAt)
            return marketADuration - marketBDuration
        }).sort((a, b) => {
            if (b.condition === "greater") return 1
            return -1
        })

    }, [data])

    return {
        data: formattedData as PredictionMarket[],
        loading,
        error
    }

}