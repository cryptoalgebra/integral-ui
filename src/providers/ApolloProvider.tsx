import { infoClient } from "@/graphql/clients";
import { ApolloProvider as _ApolloProvider } from "@apollo/client";
import { ChainId } from "@cryptoalgebra/custom-pools-sdk";

export default function ApolloProvider({ children }: { children: React.ReactNode }) {
    return <_ApolloProvider client={infoClient[ChainId.HyperEvmTestnet]}>{children}</_ApolloProvider>;
}
