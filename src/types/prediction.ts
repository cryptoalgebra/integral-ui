import { OpenMarketsForPoolListQuery, TradeFieldsFragment } from "@/graphql/generated/graphql";
import { Address } from "viem";

export type MarketCondition = "lower" | "greater"

type Markets = OpenMarketsForPoolListQuery['markets'][number];

export interface PredictionMarket extends Omit<Markets, "marketToken"> {
    id: Address;
    pool: Address;
    token0: Address;
    token1: Address;
    collateralToken: Address;
    marketToken: Number;
    condition: MarketCondition;
    userWon?: boolean;
    userRedeemed?: boolean;
} 

export type PredictionTrade = TradeFieldsFragment;