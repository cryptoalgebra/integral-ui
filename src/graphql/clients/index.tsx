import { ApolloClient, InMemoryCache } from "@apollo/client";

import AlgebraConfig from "@/algebra.config";

export const infoClient = new ApolloClient({
  uri: AlgebraConfig.SUBGRAPH.infoURL,
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
});

export const blocksClient = new ApolloClient({
  uri: AlgebraConfig.SUBGRAPH.blocklyticsURL,
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
});

export const farmingClient = new ApolloClient({
  uri: AlgebraConfig.SUBGRAPH.farmingURL,
  cache: new InMemoryCache(),
  queryDeduplication: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
});
