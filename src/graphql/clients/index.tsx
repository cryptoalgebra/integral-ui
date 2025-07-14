import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { createApolloClient } from "../utils/createApolloClient";
import { INFO_GRAPH_URL, LIMIT_ORDERS_GRAPH_URL, BLOCKS_GRAPH_URL, FARMING_GRAPH_URL, UNISWAP_GRAPH_URL } from "config/graphql-urls";

export const infoClient: Record<number, ApolloClient<NormalizedCacheObject>> = {
    [ChainId.HyperEvmTestnet]: createApolloClient(INFO_GRAPH_URL[ChainId.HyperEvmTestnet]),
};

export const limitOrderClient: Record<number, ApolloClient<NormalizedCacheObject>> = {
    [ChainId.HyperEvmTestnet]: createApolloClient(LIMIT_ORDERS_GRAPH_URL[ChainId.HyperEvmTestnet]),
};

export const blocksClient: Record<number, ApolloClient<NormalizedCacheObject>> = {
    [ChainId.HyperEvmTestnet]: createApolloClient(BLOCKS_GRAPH_URL[ChainId.HyperEvmTestnet]),
};

export const farmingClient: Record<number, ApolloClient<NormalizedCacheObject>> = {
    [ChainId.HyperEvmTestnet]: createApolloClient(FARMING_GRAPH_URL[ChainId.HyperEvmTestnet]),
};

const VITE_GRAPH_API_KEY = import.meta.env.VITE_GRAPH_API_KEY;

export const uniswapInfoClient: ApolloClient<NormalizedCacheObject> = createApolloClient(UNISWAP_GRAPH_URL, VITE_GRAPH_API_KEY);
