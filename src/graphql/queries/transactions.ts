import { gql } from "@apollo/client";

export const MINT_FRAGMENT = gql`
    fragment MintFields on Mint {
        amount
        amount0
        amount1
        amountUSD
        id
        origin
        pool {
            id
            token0 {
                ...TokenFields
            }
            token1 {
                ...TokenFields
            }
        }
        timestamp
    }
`;

export const SWAP_FRAGMENT = gql`
    fragment SwapFields on Swap {
        amount0
        amount1
        amountUSD
        id
        origin
        tick
        price
        pool {
            id
            token0 {
                ...TokenFields
            }
            token1 {
                ...TokenFields
            }
        }
        timestamp
    }
`;

export const BURN_FRAGMENT = gql`
    fragment BurnFields on Burn {
        amount
        amount0
        amount1
        amountUSD
        id
        origin
        pool {
            id
            token0 {
                ...TokenFields
            }
            token1 {
                ...TokenFields
            }
        }
        timestamp
    }
`;

export const COLLECT_FRAGMENT = gql`
    fragment CollectFields on Collect {
        amount0
        amount1
        amountUSD
        id
        owner
        pool {
            id
            token0 {
                ...TokenFields
            }
            token1 {
                ...TokenFields
            }
        }
        timestamp
    }
`;

export const MINT_TRANSACTIONS = gql`
    query MintTransactions($where: Mint_filter!) {
        mints(where: $where) {
            ...MintFields
        }
    }
`;

export const SWAP_TRANSACTIONS = gql`
    query SwapTransactions($where: Swap_filter!) {
        swaps(where: $where) {
            ...SwapFields
        }
    }
`;

export const BURN_TRANSACTIONS = gql`
    query BurnTransactions($where: Burn_filter!) {
        burns(where: $where) {
            ...BurnFields
        }
    }
`;

export const COLLECT_TRANSACTIONS = gql`
    query CollectTransactions($where: Collect_filter!) {
        collects(where: $where) {
            ...CollectFields
        }
    }
`;
