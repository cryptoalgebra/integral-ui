import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { createApolloClient } from "../utils/createApolloClient";
import { INFO_GRAPH_URL, LIMIT_ORDERS_GRAPH_URL, FARMING_GRAPH_URL, UNISWAP_GRAPH_URL, BLOCKS_GRAPH_URL } from "config/graphql-urls";

export const infoClient: Record<number, ApolloClient<NormalizedCacheObject>> = Object.fromEntries(
    Object.entries(INFO_GRAPH_URL).map(([chainId, url]) => [Number(chainId), createApolloClient(url)])
);

export const limitOrderClient: Record<number, ApolloClient<NormalizedCacheObject>> = Object.fromEntries(
    Object.entries(LIMIT_ORDERS_GRAPH_URL).map(([chainId, url]) => [Number(chainId), createApolloClient(url)])
);

export const farmingClient: Record<number, ApolloClient<NormalizedCacheObject>> = Object.fromEntries(
    Object.entries(FARMING_GRAPH_URL).map(([chainId, url]) => [Number(chainId), createApolloClient(url)])
);

export const blocksClient: Record<number, ApolloClient<NormalizedCacheObject>> = Object.fromEntries(
    Object.entries(BLOCKS_GRAPH_URL).map(([chainId, url]) => [Number(chainId), createApolloClient(url)])
);

const VITE_GRAPH_API_KEY = import.meta.env.VITE_GRAPH_API_KEY;

export const uniswapInfoClient: ApolloClient<NormalizedCacheObject> = createApolloClient(UNISWAP_GRAPH_URL, VITE_GRAPH_API_KEY);
