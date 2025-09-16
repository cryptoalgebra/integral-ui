import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

// Uses Uniswap analytics data to populate charts and DEX stats (for visual purposes only)
export const USE_UNISWAP_PLACEHOLDER_DATA = false;
export const UNISWAP_GRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/Hnjf3ipVMCkQze3jmHp8tpSMgPmtPnXBR38iM4ix1cLt"; // actually it's Thena Fusion BSC Mainnet

export const INFO_GRAPH_URL = {
    [ChainId.BaseSepolia]: "https://api.studio.thegraph.com/query/82608/ve-analytics/v0.0.1",
};

export const BLOCKS_GRAPH_URL = {
    [ChainId.BaseSepolia]: "https://api.studio.thegraph.com/query/50593/base-testnet-blocks/version/latest",
};

export const FARMING_GRAPH_URL = {
    [ChainId.BaseSepolia]: "https://api.studio.thegraph.com/query/82608/ve-farms/v0.0.1",
};

export const LIMIT_ORDERS_GRAPH_URL = {
    [ChainId.BaseSepolia]: "https://api.studio.thegraph.com/query/50593/limit-orders/v0.0.1",
};
