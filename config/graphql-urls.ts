import { ChainId } from "@cryptoalgebra/integral-sdk";

// Uses Uniswap analytics data to populate charts and DEX stats (for visual purposes only)
export const USE_UNISWAP_PLACEHOLDER_DATA = false;
export const UNISWAP_GRAPH_URL =
    "https://gateway.thegraph.com/api/4d7b59e4fd14365ae609945af85f3938/subgraphs/id/BoHp9H2rGzVFPiqc56PJ1Gw7EPDaiHMcupsUuksMGp2K"; // actually it's Thena Fusion BSC Mainnet

export const INFO_GRAPH_URL = {
    [ChainId.ADI]: "https://adi-graph.algebra.finance/subgraphs/name/analytics/",
};

export const FARMING_GRAPH_URL = {
    [ChainId.ADI]: "https://api.goldsky.com/api/public/project_cm2cd1yfmmrav01u9b02f69vj/subgraphs/integral-ve-farming/v1.0.0/gn",
};

export const LIMIT_ORDERS_GRAPH_URL = {
    [ChainId.ADI]: "https://api.goldsky.com/api/public/project_cm2cd1yfmmrav01u9b02f69vj/subgraphs/integral-ve-limits/v1.0.0/gn",
};

export const BLOCKS_GRAPH_URL = {
    [ChainId.ADI]: "https://api.goldsky.com/api/public/project_cl8ylkiw00krx0hvza0qw17vn/subgraphs/blocks/base-sepolia/gn",
};
