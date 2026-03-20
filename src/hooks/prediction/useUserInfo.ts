import { useSingleMarketUserTradesQuery } from "@/graphql/generated/graphql";
import { Address } from "viem";
import { useClients } from "../graphql/useClients";
import { useMemo } from "react";
import { PredictionTrade } from "@/types/prediction";

export function usePredictionUserInfo(address: Address | undefined, market: Address | undefined) {

    const { predictionClient } = useClients()

    const { data, loading, error } = useSingleMarketUserTradesQuery({
        variables: {
            user: address,
            market
        },
        client: predictionClient,
        skip: address === undefined
    })

    const formattedUser = useMemo(() => {

        if (!data?.trades[0]) return undefined

        return {
            ...data.trades[0],
            trades: [...data.trades].sort((a, b) => +b.timestamp - +a.timestamp).filter((trade) => ["BuyYes", "BuyNo"].includes(trade.type)) as PredictionTrade[]
        }

    }, [data])

    return {
        data: formattedUser,
        loading,
        error
    }

}