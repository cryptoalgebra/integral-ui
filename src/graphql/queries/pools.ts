import { gql } from "@apollo/client";

export const POOL_FRAGMENT = gql`
    fragment PoolFields on Pool {
        id
        fee
        token0 {
            ...TokenFields
        }
        token1 {
            ...TokenFields
        }
        sqrtPrice
        liquidity
        tick
        tickSpacing
        totalValueLockedUSD
        volumeUSD
        feesUSD
        untrackedFeesUSD
        token0Price
        token1Price
        feesToken0
        feesToken1
        deployer
    }
`;
export const TICK_FRAGMENT = gql`
    fragment TickFields on Tick {
        tickIdx
        liquidityNet
        liquidityGross
        price0
        price1
    }
`;

export const POOL_FEE_DATA_FRAGMENT = gql`
    fragment PoolFeeDataFields on PoolDayData {
        feesUSD
    }
`;

export const POOL_DAY_DATA_FRAGMENT = gql`
    fragment PoolDayDataFields on PoolDayData {
        feesUSD
        tvlUSD
        volumeUSD
        id
        date
        token0Price
        token1Price
    }
`;

export const POOL_HOUR_DATA_FRAGMENT = gql`
    fragment PoolHourDataFields on PoolHourData {
        feesUSD
        tvlUSD
        volumeUSD
        id
        periodStartUnix
        token0Price
        token1Price
    }
`;

export const POOLS_LIST = gql`
    query PoolsList {
        pools {
            ...PoolFields
            poolDayData(first: 1, orderBy: date, orderDirection: desc) {
                ...PoolDayDataFields
            }
        }
    }
`;

export const ALL_TICKS = gql`
    query allTicks($poolAddress: String!, $skip: Int!) {
        ticks(first: 1000, skip: $skip, where: { poolAddress: $poolAddress }, orderBy: tickIdx) {
            ...TickFields
        }
    }
`;

export const SINGLE_POOL = gql`
    query SinglePool($poolId: ID!) {
        pool(id: $poolId) {
            ...PoolFields
        }
    }
`;

export const MULTIPLE_POOLS = gql`
    query MultiplePools($poolIds: [ID!]) {
        pools(where: { id_in: $poolIds }) {
            ...PoolFields
        }
    }
`;

export const POOL_FEE_DATA = gql`
    query PoolFeeData($poolId: String) {
        poolDayDatas(where: { pool: $poolId }, orderBy: date, orderDirection: desc) {
            ...PoolFeeDataFields
        }
    }
`;

export const CUSTOM_POOL_DEPLOYER = gql`
    query CustomPoolDeployer($poolId: ID!) {
        pool(id: $poolId) {
            deployer
        }
    }
`;

export const POOLS_DAY_DATAS = gql`
    query PoolDayDatas($poolId: String!, $from: Int!, $to: Int!) {
        poolDayDatas(orderBy: date, orderDirection: asc, where: { pool: $poolId, date_gt: $from, date_lt: $to }) {
            date
            pool {
                id
                totalValueLockedToken0
                totalValueLockedToken1
                txCount
            }
            ...PoolDayDataFields
        }
    }
`;

export const POOLS_HOUR_DATAS = gql`
    query PoolHourDatas($poolId: String!, $from: Int!, $to: Int!) {
        poolHourDatas(
            orderBy: periodStartUnix
            orderDirection: asc
            where: { pool: $poolId, periodStartUnix_gt: $from, periodStartUnix_lt: $to }
        ) {
            periodStartUnix
            pool {
                id
                totalValueLockedToken0
                totalValueLockedToken1
                txCount
            }
            ...PoolHourDataFields
        }
    }
`;
