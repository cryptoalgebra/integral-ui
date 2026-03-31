import { Address } from "viem";
import { useClients } from "../../../hooks/graphql/useClients";
import { UserPosition, useUserPositionByMarketQuery } from "@/graphql/generated/graphql";
import { useMemo } from "react";

export function useUserPositionByMarket(address: Address | undefined, market: Address | undefined) {
    const { predictionClient } = useClients();

    const { data, loading, error } = useUserPositionByMarketQuery({
        client: predictionClient,
        variables: {
            market,
            user: address,
        },
        skip: address === undefined || market === undefined,
    });

    const formattedData = useMemo(() => {
        if (!data?.userPositions[0]) return undefined;

        const userMarketPosition = data.userPositions[0];

        return userMarketPosition;
    }, [data]);

    return {
        data: formattedData as UserPosition,
        loading,
        error,
    };
}
