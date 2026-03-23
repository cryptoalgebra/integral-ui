import { Address } from "viem"
import { useClients } from "../graphql/useClients"
import { useMarketHourDataQuery } from "@/graphql/generated/graphql"
import { useMemo } from "react"
import { MarketCondition, PredictionMarket } from "@/types/prediction"

export function useMarketHourData(id: Address | undefined) {

    const { predictionClient } = useClients()

    const { data, loading, error } = useMarketHourDataQuery({
        client: predictionClient,
        variables: {
            market: id
        },
        skip: id === undefined
    })

    const formattedData = useMemo(() => {

        if (!data) return []

        return data.marketHourDatas.map((data) => ({
            ...data,
            market: {
                ...data.market,
                id: data.market.id as Address,
                collateralToken: data.market.collateralToken as Address,
                marketToken: Number(data.market.marketToken),
                condition: data.market.condition as MarketCondition,
            } as PredictionMarket
        }))

    }, [data])

    return {
        data: formattedData,
        loading,
        error
    }

}