import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

// Uses Uniswap analytics data to populate charts and DEX stats (for visual purposes only)
export const USE_UNISWAP_PLACEHOLDER_DATA = false;
export const UNISWAP_GRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/Hnjf3ipVMCkQze3jmHp8tpSMgPmtPnXBR38iM4ix1cLt"; // actually it's Thena Fusion BSC Mainnet

export const INFO_GRAPH_URL = {
    [ChainId.MegaethMainnet]: "https://api.studio.thegraph.com/query/111290/analytics-mainnet/version/latest",
    [ChainId.MegaethTestnet]: "https://api.studio.thegraph.com/query/111290/analytics-testnet/version/latest",
};

export const FARMING_GRAPH_URL = {
    [ChainId.MegaethMainnet]: "https://api.studio.thegraph.com/query/111290/farming-mainnet/version/latest",
    [ChainId.MegaethTestnet]: "https://api.studio.thegraph.com/query/111290/farming-testnet/version/latest",
};

export const LIMIT_ORDERS_GRAPH_URL = {
    [ChainId.MegaethMainnet]:
        "https://api.studio.thegraph.com/query/111290/limit-orders-mainnet/version/latest",
    [ChainId.MegaethTestnet]:
        "https://api.studio.thegraph.com/query/111290/limit-orders-testnet/version/latest",
};
