import { useUserInfoQuery } from "@/graphql/generated/graphql";
import { Address } from "viem";
import { useClients } from "../../../hooks/graphql/useClients";
import { useMemo } from "react";
import { MarketCondition, PredictionMarket } from "@/modules/PredictionModule/types/prediction";

export function useUserMarkets(address: Address | undefined) {
    const { predictionClient } = useClients();

    const { data, loading, error } = useUserInfoQuery({
        variables: {
            user: address,
        },
        client: predictionClient,
        skip: address === undefined,
    });

    const formattedData = useMemo(() => {
        if (!data?.users[0])
            return {
                closedMarkets: [],
                openedMarkets: [],
            };

        const now = Date.now();

        return {
            closedMarkets: data.users[0].positions
                .filter((position) => Number(position.market.plannedResolutionTimestamp) * 1000 <= now)
                .map((position) => {
                    const userWon = position.market.outcome === 1 ? Number(position.yesShares) > 0 : Number(position.noShares) > 0;

                    return {
                        ...position.market,
                        id: position.market.id as Address,
                        collateralToken: position.market.collateralToken as Address,
                        marketToken: Number(position.market.marketToken),
                        condition: position.market.condition as MarketCondition,
                        userRedeemed: position.redeemed,
                        userWon,
                    };
                })
                .sort((a, b) => {
                    const getPriority = (m: any) => {
                        if (m.userWon && !m.userRedeemed) return 0;
                        if (m.userRedeemed) return 1;
                        return 2;
                    };

                    const pa = getPriority(a);
                    const pb = getPriority(b);

                    if (pa !== pb) return pa - pb;

                    return Number(b.plannedResolutionTimestamp) - Number(a.plannedResolutionTimestamp);
                }) as PredictionMarket[],
            openedMarkets: data.users[0].positions
                .filter((position) => Number(position.market.plannedResolutionTimestamp) * 1000 > now)
                .map((position) => ({
                    ...position.market,
                    id: position.market.id as Address,
                    collateralToken: position.market.collateralToken as Address,
                    marketToken: Number(position.market.marketToken),
                    condition: position.market.condition as MarketCondition,
                })) as PredictionMarket[],
        };
    }, [data]);

    return {
        data: formattedData,
        loading,
        error,
    };
}
