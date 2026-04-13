import { gql } from "@apollo/client";

export const MARKET_FRAGMENT = gql`
    fragment MarketFields on Market {
        id
        pool
        collateralToken
        marketToken
        quoteToken
        tradingDeadline
        plannedResolutionTimestamp
        mark
        condition
        seeded
        seedAmount
        outcome
        qYes
        qNo
        accruedFees
        totalVolume
        totalTrades
        activeUsers
        createdAt
    }
`;

export const USER_POSITION_FRAGMENT = gql`
    fragment UserPositionFields on UserPosition {
        id
        user {
            id
        }
        market {
            ...MarketFields
        }
        yesShares
        noShares
        totalYesBought
        totalNoBought
        totalYesSold
        totalNoSold
        totalSpent
        totalReceived
        totalFeesPaid
        redeemed
        redeemedAmount
    }
`;

export const TRADE_FRAGMENT = gql`
    fragment TradeFields on Trade {
        id
        market {
            ...MarketFields
        }
        user {
            id
        }
        type
        shares
        cost
        fee
        timestamp
        txHash
    }
`;

export const USER_FRAGMENT = gql`
    fragment UserFields on User {
        positions {
            ...UserPositionFields
        }
        trades {
            ...TradeFields
        }
    }
`;

export const MARKET_FIVE_MINUTE_FRAGMENT = gql`
    fragment MarketFiveMinuteFields on MarketFiveMinuteData {
        id
        market {
            ...MarketFields
        }
        date
        qYes
        qNo
        priceYes
        volume
        fees
        txCount
    }
`;

export const OPEN_MARKETS_FOR_POOL_LIST = gql`
    query OpenMarketsForPoolList($pool: Bytes) {
        markets(where: { pool: $pool, seeded: true, outcome: 0 }) {
            ...MarketFields
        }
    }
`;

export const OPEN_MARKETS_BY_TOKENS_LIST = gql`
    query OpenMarketsByTokensList($token0: Bytes, $token1: Bytes) {
        markets(
            where: {
                or: [
                    { seeded: true, outcome: 0, marketToken: $token0 }
                    { seeded: true, outcome: 0, marketToken: $token1 }
                    { seeded: true, outcome: 0, quoteToken: $token0 }
                    { seeded: true, outcome: 0, quoteToken: $token1 }
                ]
            }
        ) {
            ...MarketFields
        }
    }
`;

export const USER_INFO = gql`
    query UserInfo($user: Bytes) {
        users(where: { id: $user }) {
            ...UserFields
        }
    }
`;

export const TRADES_BY_MARKET = gql`
    query TradesByMarket($market: String) {
        trades(where: { market: $market }) {
            ...TradeFields
        }
    }
`;

export const ALL_OPEN_MARKETS_LIST = gql`
    query AllOpenMarketsList {
        markets(where: { seeded: true, outcome: 0 }) {
            ...MarketFields
        }
    }
`;

export const SINGLE_MARKET = gql`
    query SingleMarket($market: ID!) {
        market(id: $market) {
            ...MarketFields
        }
    }
`;

export const SINGLE_MARKET_USER_TRADES = gql`
    query SingleMarketUserTrades($market: String, $user: String) {
        trades(where: { market: $market, user: $user }) {
            ...TradeFields
        }
    }
`;

export const MARKET_HOUR_DATA = gql`
    query MarketFiveMinuteData($market: String) {
        marketFiveMinuteDatas(where: { market: $market }) {
            ...MarketFiveMinuteFields
        }
    }
`;

export const USER_POSITION_BY_MARKET = gql`
    query UserPositionByMarket($market: String, $user: String) {
        userPositions(where: { market: $market, user: $user }) {
            ...UserPositionFields
        }
    }
`;
