import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

// Uses Uniswap analytics data to populate charts and DEX stats (for visual purposes only)
export const USE_UNISWAP_PLACEHOLDER_DATA = false;
export const UNISWAP_GRAPH_URL = "https://gateway.thegraph.com/api/subgraphs/id/Hnjf3ipVMCkQze3jmHp8tpSMgPmtPnXBR38iM4ix1cLt"; // actually it's Thena Fusion BSC Mainnet

export const INFO_GRAPH_URL = {
    [ChainId.Base]:
        "https://gateway.thegraph.com/api/4d7b59e4fd14365ae609945af85f3938/subgraphs/id/5pwQHNUqE7GFeG7C32m2HM3vhXvoQpet4HAinmHFmxW5",
    [ChainId.BaseSepolia]: "https://api.studio.thegraph.com/query/50593/base-testnet-info/version/latest",
};

export const FARMING_GRAPH_URL = {
    [ChainId.Base]:
        "https://gateway.thegraph.com/api/4d7b59e4fd14365ae609945af85f3938/subgraphs/id/5ASqXjxabMNbiqXML7YBMDR7QVRgU6oFe5R8sYi4Uwtn",
    [ChainId.BaseSepolia]: "https://api.studio.thegraph.com/query/50593/base-testnet-farms/version/latest",
};

export const LIMIT_ORDERS_GRAPH_URL = {
    [ChainId.Base]: "https://api.studio.thegraph.com/query/50593/clamm-limits/v1.2.4",
    [ChainId.BaseSepolia]: "https://api.studio.thegraph.com/query/50593/base-testnet-limits/v0.0.5",
};

export const BLOCKS_GRAPH_URL = {
    [ChainId.Base]: "https://api.studio.thegraph.com/query/50593/clamm-blocks/version/latest",
    [ChainId.BaseSepolia]: "",
};
