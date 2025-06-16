import { ApolloClient, InMemoryCache } from "@apollo/client";

export const createApolloClient = (uri: string) => new ApolloClient({ uri, cache: new InMemoryCache() });
