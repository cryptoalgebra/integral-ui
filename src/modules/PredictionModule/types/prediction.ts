import { OpenMarketsForPoolListQuery, TradeFieldsFragment } from "@/graphql/generated/graphql";
import { Address } from "viem";

export type MarketCondition = "lower" | "greater";

type Markets = OpenMarketsForPoolListQuery["markets"][number];

type MarketId = `${Address}-${number}`

export interface PredictionMarket extends Markets {
    id: MarketId;
    index: bigint;
    pool: Address;
    marketToken: Address;
    quoteToken: Address;
    collateralToken: Address;
    condition: MarketCondition;
    userWon?: boolean;
    userRedeemed?: boolean;
}

export type PredictionTrade = TradeFieldsFragment;
