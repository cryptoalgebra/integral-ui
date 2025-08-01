// Hyperliquid Mainnet Chain ID
const HYPERLIQUID_CHAIN_ID = 999;
const BASE_SEPOLIA_CHAIN_ID = 84532;

// NOTE: For codegen to work, we currently use Base Sepolia endpoints
// The actual Hyperliquid subgraphs will be deployed at the URLs below

// Uses Uniswap analytics data to populate charts and DEX stats (for visual purposes only)
export const USE_UNISWAP_PLACEHOLDER_DATA = false; // Changed to false to use real data
export const UNISWAP_GRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/Hnjf3ipVMCkQze3jmHp8tpSMgPmtPnXBR38iM4ix1cLt"; // actually it's Thena Fusion BSC Mainnet

// Goldsky Subgraph URLs for Hyperliquid
const GOLDSKY_BASE_URL = "https://api.goldsky.com/api/public/project_cmay1j7dh90w601r2hjv26a5b/subgraphs";

export const INFO_GRAPH_URL = {
    [BASE_SEPOLIA_CHAIN_ID]: "https://api.studio.thegraph.com/query/50593/integral-v12/v1.0.0",
    [HYPERLIQUID_CHAIN_ID]: `${GOLDSKY_BASE_URL}/hx-analytics/v1.4.5/gn`, // HX Analytics on Goldsky
};

export const BLOCKS_GRAPH_URL = {
    [BASE_SEPOLIA_CHAIN_ID]: "https://api.studio.thegraph.com/query/50593/base-testnet-blocks/version/latest",
    [HYPERLIQUID_CHAIN_ID]: `${GOLDSKY_BASE_URL}/blocks/v1.0.0/gn`, // Blocks on Goldsky
};

export const FARMING_GRAPH_URL = {
    [BASE_SEPOLIA_CHAIN_ID]: "https://api.studio.thegraph.com/query/50593/integral-v12-farming/v1.0.2",
    [HYPERLIQUID_CHAIN_ID]: `${GOLDSKY_BASE_URL}/algebra-farming/1.0.0/gn`, // Algebra Farming on Goldsky
};

export const LIMIT_ORDERS_GRAPH_URL = {
    [BASE_SEPOLIA_CHAIN_ID]: "https://api.studio.thegraph.com/query/50593/limit-orders/v0.0.1",
    [HYPERLIQUID_CHAIN_ID]: `${GOLDSKY_BASE_URL}/algebra-limits/1.0.0/gn`, // Algebra Limits on Goldsky
};

// Additional Goldsky URLs for specific features
export const POINTS_GRAPH_URL = {
    [HYPERLIQUID_CHAIN_ID]: `${GOLDSKY_BASE_URL}/hx-points/v1/gn`, // HX Points on Goldsky
};

export const PRICE_ORACLE_GRAPH_URL = {
    [HYPERLIQUID_CHAIN_ID]: `${GOLDSKY_BASE_URL}/hxfinance-price-oracle/v1/gn`, // Price Oracle on Goldsky
};
