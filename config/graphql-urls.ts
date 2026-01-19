import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

// Uses Uniswap analytics data to populate charts and DEX stats (for visual purposes only)
export const USE_UNISWAP_PLACEHOLDER_DATA = true;
export const UNISWAP_GRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/Hnjf3ipVMCkQze3jmHp8tpSMgPmtPnXBR38iM4ix1cLt"; // actually it's Thena Fusion BSC Mainnet

export const INFO_GRAPH_URL = {
    [ChainId.CitreaMainnet]: "https://api.goldsky.com/api/public/project_cmamb6kkls0v2010932jjhxj4/subgraphs/analytics-mainnet/v1.0.1/gn",
};

export const FARMING_GRAPH_URL = {
    [ChainId.CitreaMainnet]: "https://api.goldsky.com/api/public/project_cmamb6kkls0v2010932jjhxj4/subgraphs/farms-mainnet/v1.0.0/gn",
};

export const LIMIT_ORDERS_GRAPH_URL = {
    [ChainId.CitreaMainnet]:
        "https://api.studio.thegraph.com/query/82608/ve-limits/version/latest",
};
