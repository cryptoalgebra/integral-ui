import { gql } from "@apollo/client";

export const TOKEN_FRAGMENT = gql`
    fragment TokenFields on Token {
        id
        symbol
        name
        decimals
        derivedMatic
        volumeUSD
        totalValueLockedUSD
        feesUSD
        txCount
    }
`;

export const SINGLE_TOKEN = gql`
    query SingleToken($tokenId: ID!) {
        token(id: $tokenId) {
            ...TokenFields
        }
    }
`;

export const ALL_TOKENS = gql`
    query AllTokens {
        tokens {
            ...TokenFields
        }
    }
`;

export const TOKEN_DAY_DATA_FRAGMENT = gql`
    fragment TokenDayDataFields on TokenDayData {
        feesUSD
        totalValueLockedUSD
        volumeUSD
        id
        date
        open
        high
        low
        close
        priceUSD
        totalValueLocked
    }
`;

export const TOKEN_HOUR_DATA_FRAGMENT = gql`
    fragment TokenHourDataFields on TokenHourData {
        feesUSD
        totalValueLockedUSD
        volumeUSD
        id
        periodStartUnix
        open
        high
        low
        close
        priceUSD
        totalValueLocked
    }
`;

export const TOKEN_DAY_DATAS = gql`
    query TokenDayDatas($token: String!, $from: Int!, $to: Int!) {
        tokenDayDatas(orderBy: date, orderDirection: asc, where: { token: $token, date_gt: $from, date_lt: $to }) {
            date
            token {
                ...TokenFields
            }
            ...TokenDayDataFields
        }
    }
`;

export const TOKEN_HOUR_DATAS = gql`
    query TokenHourDatas($token: String!, $from: Int!, $to: Int!) {
        tokenHourDatas(
            orderBy: periodStartUnix
            orderDirection: asc
            where: { token: $token, periodStartUnix_gt: $from, periodStartUnix_lt: $to }
        ) {
            periodStartUnix
            token {
                ...TokenFields
            }
            ...TokenHourDataFields
        }
    }
`;
