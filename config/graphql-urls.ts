import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

// Uses Uniswap analytics data to populate charts and DEX stats (for visual purposes only)
export const USE_UNISWAP_PLACEHOLDER_DATA = true;
export const UNISWAP_GRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/Hnjf3ipVMCkQze3jmHp8tpSMgPmtPnXBR38iM4ix1cLt"; // actually it's Thena Fusion BSC Mainnet

export const INFO_GRAPH_URL = {
    [ChainId.BaseSepolia]: "https://api.goldsky.com/api/public/project_cm2cd1yfmmrav01u9b02f69vj/subgraphs/integral-ve-analytics/v1.0.0/gn",
};

export const FARMING_GRAPH_URL = {
    [ChainId.BaseSepolia]:
        "https://api.goldsky.com/api/public/project_cm2cd1yfmmrav01u9b02f69vj/subgraphs/integral-ve-farming/v1.0.0/gn",
};

export const LIMIT_ORDERS_GRAPH_URL = {
    [ChainId.BaseSepolia]:
        "https://api.goldsky.com/api/public/project_cm2cd1yfmmrav01u9b02f69vj/subgraphs/integral-ve-limits/v1.0.0/gn",
};