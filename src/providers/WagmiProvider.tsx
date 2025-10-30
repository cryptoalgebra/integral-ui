import React from "react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { WagmiProvider as _WagmiProvider } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiNetworks } from "config/wagmi";
import { CHAIN_IMAGE, DEFAULT_CHAIN_ID } from "config/default-chain";
import { http } from "viem";

const PROJECT_ID = import.meta.env.VITE_REOWN_PROJECT_ID;

const queryClient = new QueryClient();

const transports = Object.fromEntries(wagmiNetworks.map((network) => [network.id, http(network.rpcUrls.default.http[0])]));

const wagmiAdapter = new WagmiAdapter({
    networks: wagmiNetworks,
    projectId: PROJECT_ID,
    transports,
});

createAppKit({
    adapters: [wagmiAdapter],
    networks: wagmiNetworks,
    projectId: PROJECT_ID,
    defaultNetwork: wagmiNetworks.find(({ id }) => id === DEFAULT_CHAIN_ID)!,
    themeMode: "light",
    chainImages: {
        ...CHAIN_IMAGE,
    },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
    return (
        <_WagmiProvider config={wagmiAdapter.wagmiConfig}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </_WagmiProvider>
    );
}
