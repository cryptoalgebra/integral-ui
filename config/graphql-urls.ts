import { ChainId } from "@cryptoalgebra/integral-sdk";

// Uses Uniswap analytics data to populate charts and DEX stats (for visual purposes only)
export const USE_UNISWAP_PLACEHOLDER_DATA = false;
export const UNISWAP_GRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/HMuAwufqZ1YCRmzL2SfHTVkzZovC9VL2UAKhjvRqKiR1"; // actually it's Uni Base

export const INFO_GRAPH_URL = {
    [ChainId.Robinhood]: "https://api.goldsky.com/api/public/project_cm8pwdzcow9bu01xm6gdhatu4/subgraphs/analytics/v1.0.0/gn",
};

export const FARMING_GRAPH_URL = {
    [ChainId.Robinhood]: "https://api.goldsky.com/api/public/project_cm8pwdzcow9bu01xm6gdhatu4/subgraphs/farmings/v1.0.0/gn",
};

export const LIMIT_ORDERS_GRAPH_URL = {
    [ChainId.Robinhood]: "https://api.goldsky.com/api/public/project_cm8pwdzcow9bu01xm6gdhatu4/subgraphs/limits/v1.0.0/gn",
};

export const PREDICTION_GRAPH_URL = {
    [ChainId.Robinhood]: "https://api.studio.thegraph.com/query/50593/prediction-market/v2.0.9",
};

// Boosted tokens APR
export const BLOCKS_GRAPH_URL = {
    [ChainId.Robinhood]: "https://api.goldsky.com/api/public/project_cl8ylkiw00krx0hvza0qw17vn/subgraphs/blocks/base-sepolia/gn",
};
