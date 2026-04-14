import { useUserInfoQuery } from "@/graphql/generated/graphql";
import { Address } from "viem";
import { useClients } from "../../../hooks/graphql/useClients";
import { useMemo } from "react";
import { PredictionMarket } from "@/modules/PredictionModule/types/prediction";

export interface UserClosedMarket extends PredictionMarket {
    yesShares: string;
    noShares: string;
    totalSpent: string;
    totalReceived: string;
    redeemedAmount: string;
}

export interface UserOpenMarket extends PredictionMarket {
    yesShares: string;
    noShares: string;
    totalSpent: string;
}

export function useUserMarkets(address: Address | undefined) {
    const { predictionClient } = useClients();

    const { data, loading, error, refetch } = useUserInfoQuery({
        variables: {
            user: address,
        },
        client: predictionClient,
        skip: address === undefined,
    });

    const formattedData = useMemo(() => {
        if (!data?.users[0])
            return {
                closedMarkets: [] as UserClosedMarket[],
                openedMarkets: [] as UserOpenMarket[],
            };

        const now = Date.now();

        return {
            closedMarkets: data.users[0].positions
                .filter((position) => Number(position.market.plannedResolutionTimestamp) * 1000 <= now)
                .map((position) => {
                    const outcome = position.market.outcome;
                    // outcome: 0 = unresolved, 1 = YES won, 2 = NO won
                    const userWon = outcome === 1 ? Number(position.yesShares) > 0 : outcome === 2 ? Number(position.noShares) > 0 : false;

                    return {
                        ...position.market,
                        index: BigInt(position.market.id.split("-")[1]),
                        userRedeemed: position.redeemed,
                        userWon,
                        yesShares: position.yesShares,
                        noShares: position.noShares,
                        totalSpent: position.totalSpent,
                        totalReceived: position.totalReceived,
                        redeemedAmount: position.redeemedAmount,
                    };
                })
                .sort((a, b) => {
                    const getPriority = (m: typeof a) => {
                        if (m.userWon && !m.userRedeemed) return 0; // Can claim - highest priority
                        if (!m.userWon && !m.userRedeemed) return 1; // Lost but not acknowledged
                        if (m.userRedeemed) return 2; // Already claimed
                        return 3;
                    };

                    const pa = getPriority(a);
                    const pb = getPriority(b);

                    if (pa !== pb) return pa - pb;

                    return Number(b.plannedResolutionTimestamp) - Number(a.plannedResolutionTimestamp);
                }) as UserClosedMarket[],
            openedMarkets: data.users[0].positions
                .filter((position) => Number(position.market.plannedResolutionTimestamp) * 1000 > now)
                .map((position) => ({
                    ...position.market,
                    index: BigInt(position.market.id.split("-")[1]),
                    yesShares: position.yesShares,
                    noShares: position.noShares,
                    totalSpent: position.totalSpent,
                }))
                .sort((a, b) => Number(a.plannedResolutionTimestamp) - Number(b.plannedResolutionTimestamp)) as UserOpenMarket[],
        };
    }, [data]);

    return {
        data: formattedData,
        loading,
        error,
        refetch,
    };
}
