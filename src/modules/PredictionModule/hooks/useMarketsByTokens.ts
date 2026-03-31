import { useOpenMarketsByTokensListQuery } from "@/graphql/generated/graphql";
import { Address } from "viem";
import { useClients } from "../../../hooks/graphql/useClients";
import { useMemo } from "react";
import { MarketCondition, PredictionMarket } from "@/modules/PredictionModule/types/prediction";
import { DEFAULT_CHAIN_ID, TOKENS } from "config";

export function useMarketsByTokens(token0: Address | undefined, token1: Address | undefined) {
    const { predictionClient } = useClients();

    const { data, loading, error } = useOpenMarketsByTokensListQuery({
        variables: {
            token0: token0?.toLowerCase() === TOKENS[DEFAULT_CHAIN_ID].USDC.address.toLowerCase() ? undefined : token0,
            token1: token1?.toLowerCase() === TOKENS[DEFAULT_CHAIN_ID].USDC.address.toLowerCase() ? undefined : token1,
        },
        client: predictionClient,
        skip: token0 === undefined && token1 === undefined,
        pollInterval: 60_000,
    });

    const formattedData = useMemo(() => {
        if (!data) return [];

        return data.markets
            .map((market) => ({
                ...market,
                id: market.id as Address,
                collateralToken: market.collateralToken as Address,
                marketToken: Number(market.marketToken),
                condition: market.condition as MarketCondition,
            }))
            .sort((a, b) => {
                const marketADuration = Number(a.plannedResolutionTimestamp) - Number(a.createdAt);
                const marketBDuration = Number(b.plannedResolutionTimestamp) - Number(b.createdAt);
                return marketADuration - marketBDuration;
            })
            .sort((a, b) => {
                if (b.condition === "greater") return 1;
                return -1;
            });
    }, [data]);

    return {
        data: formattedData as PredictionMarket[],
        loading,
        error,
    };
}
