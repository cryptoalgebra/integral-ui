import { useUserInfoQuery } from "@/graphql/generated/graphql";
import { Address } from "viem";
import { useClients } from "../graphql/useClients";
import { useMemo } from "react";
import { PredictionTrade } from "@/types/prediction";

export function usePredictionUserInfo(address: Address | undefined) {

    const { predictionClient } = useClients()

    const { data, loading, error } = useUserInfoQuery({
        variables: {
            user: address
        },
        client: predictionClient,
        skip: address === undefined
    })

    const formattedUser = useMemo(() => {

        if (!data?.users[0]) return undefined

        return {
            ...data.users[0],
            trades: [...data.users[0].trades].sort((a, b) => +b.timestamp - +a.timestamp).filter((trade) => ["BuyYes", "BuyNo"].includes(trade.type)) as PredictionTrade[]
        }

    }, [data])

    return {
        data: formattedUser,
        loading,
        error
    }

}