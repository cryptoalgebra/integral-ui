import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { ChainId } from "@cryptoalgebra/custom-pools-sdk";
import { createApolloClient } from "../utils/createApolloClient";

export const infoClient: Record<number, ApolloClient<NormalizedCacheObject>> = {
    [ChainId.Base]: createApolloClient(import.meta.env.VITE_INFO_GRAPH),
    [ChainId.BaseSepolia]: createApolloClient(import.meta.env.VITE_INFO_GRAPH_TESTNET),
};

export const limitOrderClient: Record<number, ApolloClient<NormalizedCacheObject>> = {
    [ChainId.Base]: createApolloClient(import.meta.env.VITE_LIMIT_ORDERS_GRAPH),
    [ChainId.BaseSepolia]: createApolloClient(import.meta.env.VITE_LIMIT_ORDERS_GRAPH_TESTNET),
};

export const blocksClient: Record<number, ApolloClient<NormalizedCacheObject>> = {
    [ChainId.Base]: createApolloClient(import.meta.env.VITE_BLOCKS_GRAPH),
    [ChainId.BaseSepolia]: createApolloClient(import.meta.env.VITE_BLOCKS_GRAPH_TESTNET),
};

export const farmingClient: Record<number, ApolloClient<NormalizedCacheObject>> = {
    [ChainId.Base]: createApolloClient(import.meta.env.VITE_FARMING_GRAPH),
    [ChainId.BaseSepolia]: createApolloClient(import.meta.env.VITE_FARMING_GRAPH_TESTNET),
};
