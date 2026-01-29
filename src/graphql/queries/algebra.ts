import { gql } from "@apollo/client";

export const ALGEBRA_DAY_DATA_FRAGMENT = gql`
    fragment AlgebraDayDataFields on AlgebraDayData {
        tvlUSD
        txCount
        volumeUSD
        id
        feesUSD
        date
    }
`;

export const ALGEBRA_HOUR_DATA_FRAGMENT = gql`
    fragment AlgebraHourDataFields on AlgebraHourData {
        tvlUSD
        txCount
        volumeUSD
        id
        feesUSD
        date
    }
`;

export const ALGEBRA_DAY_DATA = gql`
    query AlgebraDayDatas($from: Int!, $to: Int!) {
        algebraDayDatas(where: { date_gt: $from, date_lt: $to }) {
            ...AlgebraDayDataFields
        }
    }
`;

export const ALGEBRA_HOUR_DATA = gql`
    query AlgebraHourDatas($from: Int!, $to: Int!) {
        algebraHourDatas(where: { date_gt: $from, date_lt: $to }) {
            ...AlgebraHourDataFields
        }
    }
`;

export const ALGEBRA_TVL_DATA = gql`
    query AlgebraTvlData {
        factories {
            totalValueLockedUSD
        }
    }
`;
