import { ChainId } from "@cryptoalgebra/integral-sdk";

// Uses Uniswap analytics data to populate charts and DEX stats (for visual purposes only)
export const USE_UNISWAP_PLACEHOLDER_DATA = false;
export const UNISWAP_GRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/HMuAwufqZ1YCRmzL2SfHTVkzZovC9VL2UAKhjvRqKiR1"; // actually it's Uni Base

export const INFO_GRAPH_URL = {
    [ChainId.AlpenTestnet]: "https://alpen-graph.algebra.finance/subgraphs/name/analytics",
};

export const FARMING_GRAPH_URL = {
    [ChainId.AlpenTestnet]: "https://api.studio.thegraph.com/query/50593/base-testnet-farms/v0.0.2",
};

export const LIMIT_ORDERS_GRAPH_URL = {
    [ChainId.AlpenTestnet]: "https://api.studio.thegraph.com/query/50593/base-testnet-limits/v0.0.6",
};

export const PREDICTION_GRAPH_URL = {
    [ChainId.AlpenTestnet]: "https://api.studio.thegraph.com/query/50593/prediction-market/v2.0.9",
};

// Boosted tokens APR
export const BLOCKS_GRAPH_URL = {
    [ChainId.AlpenTestnet]: "https://api.goldsky.com/api/public/project_cl8ylkiw00krx0hvza0qw17vn/subgraphs/blocks/base-sepolia/gn",
};
