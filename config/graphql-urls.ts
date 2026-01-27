import { ChainId } from "@cryptoalgebra/integral-sdk";

// Uses Uniswap analytics data to populate charts and DEX stats (for visual purposes only)
export const USE_UNISWAP_PLACEHOLDER_DATA = true;
export const UNISWAP_GRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/Hnjf3ipVMCkQze3jmHp8tpSMgPmtPnXBR38iM4ix1cLt"; // actually it's Thena Fusion BSC Mainnet

export const INFO_GRAPH_URL = {
    [ChainId.BaseSepolia]: "https://api.goldsky.com/api/public/project_cm2cd1yfmmrav01u9b02f69vj/subgraphs/integral-ve-analytics/v1.0.0/gn",
};

export const FARMING_GRAPH_URL = {
    [ChainId.BaseSepolia]:
        "https://gateway.thegraph.com/api/4d7b59e4fd14365ae609945af85f3938/subgraphs/id/4hv4Ykhpu6Lie1JrWYpnaYzGC8gpLSd29PBz8cgbKvCC",
};

export const LIMIT_ORDERS_GRAPH_URL = {
    [ChainId.BaseSepolia]:
        "https://gateway.thegraph.com/api/4d7b59e4fd14365ae609945af85f3938/subgraphs/id/7WZVpgeBC9JK2ZQZ1RDsYxTKvBmhaKGP1BPFdctfKvi1",
};

export const BLOCKS_GRAPH_URL = {
    [ChainId.BaseSepolia]:
        "https://gateway.thegraph.com/api/4d7b59e4fd14365ae609945af85f3938/subgraphs/id/9PGjvCHKxma2SKGpvpTr4WSrHTUVk7JzZLQVHXVJFjAE",
};
