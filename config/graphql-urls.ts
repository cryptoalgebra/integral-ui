import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

// Uses Uniswap analytics data to populate charts and DEX stats (for visual purposes only)
export const USE_UNISWAP_PLACEHOLDER_DATA = true;
export const UNISWAP_GRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/Hnjf3ipVMCkQze3jmHp8tpSMgPmtPnXBR38iM4ix1cLt"; // actually it's Thena Fusion BSC Mainnet

export const INFO_GRAPH_URL = {
    [ChainId.BaseSepolia]:
        "https://gateway.thegraph.com/api/4d7b59e4fd14365ae609945af85f3938/subgraphs/id/AmmgvUmLbQK3k8xJd3SPHkuo989mu8J5jj4kkBhdsnMG",
};

export const FARMING_GRAPH_URL = {
    [ChainId.BaseSepolia]:
        "https://gateway.thegraph.com/api/4d7b59e4fd14365ae609945af85f3938/subgraphs/id/4hv4Ykhpu6Lie1JrWYpnaYzGC8gpLSd29PBz8cgbKvCC",
};

export const LIMIT_ORDERS_GRAPH_URL = {
    [ChainId.BaseSepolia]:
        "https://gateway.thegraph.com/api/4d7b59e4fd14365ae609945af85f3938/subgraphs/id/7WZVpgeBC9JK2ZQZ1RDsYxTKvBmhaKGP1BPFdctfKvi1",
};
