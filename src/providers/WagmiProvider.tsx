import React from "react";
import { MFA_LEVELS, WEB3AUTH_NETWORK } from "@web3auth/modal";
import { Web3AuthProvider, type Web3AuthContextConfig } from "@web3auth/modal/react";
import { WagmiProvider as _WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DEFAULT_CHAIN_ID } from "config/default-chain";
import { createConfig, http } from "wagmi";
import { wagmiNetworks } from "config/wagmi";

const PROJECT_ID = import.meta.env.VITE_WEB3AUTH_ID;

const queryClient = new QueryClient();

const web3AuthContextConfig: Web3AuthContextConfig = {
    web3AuthOptions: {
        clientId: PROJECT_ID,
        web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        walletServicesConfig: {
            confirmationStrategy: 'modal',
            loginMode: 'embed',
        },
        initialAuthenticationMode: 'connect-only',
        ssr: true,
        mfaLevel: MFA_LEVELS.DEFAULT,
        defaultChainId: `0x${DEFAULT_CHAIN_ID.toString(16)}`,
        modalConfig: {
            connectors: {
                ['auth']: {
                    label: 'auth',
                    loginMethods: {
                        google: {
                            name: 'google login',
                            authConnection: 'google',
                            authConnectionId: 'algebra-test1',
                        },
                    },
                },
            },
        }
    }
};

export const wagmiConfig = createConfig({
    chains: wagmiNetworks as any,
    transports: {
      [DEFAULT_CHAIN_ID]: http('https://henesys-rpc.msu.io')
    },
  })

export default function WagmiProvider({ children }: { children: React.ReactNode }) {
    return (
        <Web3AuthProvider config={web3AuthContextConfig}>
            <QueryClientProvider client={queryClient}>
                <_WagmiProvider>
                    {children}
                </_WagmiProvider>
            </QueryClientProvider>
        </Web3AuthProvider>
    );
}
