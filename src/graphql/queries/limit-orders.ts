import { gql } from "@apollo/client";

export const EPOCH_FRAGMENT = gql`
    fragment EpochFields on Epoch {
        id
        pool
        filled
        totalLiquidity
        fillTimestamp
    }
`;

export const LIMIT_ORDER_FRAGMENT = gql`
    fragment LimitOrderFields on LimitOrder {
        id
        epoch {
            ...EpochFields
        }
        placeTimestamp
        closeTimestamp
        owner
        pool
        liquidity
        initialLiquidity
        killedLiquidity
        tickLower
        tickUpper
        zeroToOne
        killed
    }
`;

export const LIMIT_ORDERS_LIST = gql`
    query LimitOrdersList($account: Bytes) {
        limitOrders(where: { owner: $account }) {
            ...LimitOrderFields
        }
    }
`;
