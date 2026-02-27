import ApolloProvider from "./ApolloProvider";
import RouterProvider from "./RouterProvider";
import StoreCleaner from "./StoreCleaner";
import WagmiProvider from "./WagmiProvider";

export default function Providers() {
    return (
        <ApolloProvider>
            <WagmiProvider>
                <RouterProvider />
                <StoreCleaner />
            </WagmiProvider>
        </ApolloProvider>
    );
}
