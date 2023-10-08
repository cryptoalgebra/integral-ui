import { ApolloClient, InMemoryCache } from "@apollo/client";

export const infoClient = new ApolloClient({
    // uri: import.meta.env.VITE_INFO_GRAPH,
    uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    cache: new InMemoryCache(),
});

export const limitOrderClient = new ApolloClient({
    uri: import.meta.env.VITE_LIMIT_ORDERS_GRAPH,
    cache: new InMemoryCache(),
});

export const blocksClient = new ApolloClient({
    // uri: import.meta.env.VITE_BLOCKS_GRAPH,
    uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
    cache: new InMemoryCache()
})
