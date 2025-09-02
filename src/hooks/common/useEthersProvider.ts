import { wagmiConfig } from "@/providers/WagmiProvider";
import { ADDRESS_ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { providers } from "ethers";
import { useMemo } from "react";
import type { Account, Chain, Client, Transport } from "viem";
import { useChainId, useConnectorClient, usePublicClient } from "wagmi";

export function clientToJsonRpcProvider(client: Client<Transport, Chain>) {
    const { chain, transport } = client;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    if (transport.type === "fallback")
        return new providers.FallbackProvider(
            (transport.transports as ReturnType<Transport>[]).map(({ value }) => new providers.JsonRpcProvider(value?.url, network))
        ) as unknown as providers.JsonRpcProvider;
    return new providers.JsonRpcProvider(transport.url, network);
}

// /** Action to convert a viem Client to an ethers.js Provider. */
// export function useEthersProvider() {
//     const chainId = useChainId();
//     const client = usePublicClient({ chainId });

//     return useMemo(() => {
//         if (!client) throw new Error("No client");
//         return clientToJsonRpcProvider(client);
//     }, [client?.key]);
// }

function clientToWeb3Provider(client: Client<Transport, Chain, Account>) {
    const { chain, transport } = client;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: ADDRESS_ZERO,
    };
    const provider = new providers.Web3Provider(transport, network);
    return provider;
}

/** Action to convert a viem Client to an ethers.js Provider. */
export function useEthersProvider() {
    const chainId = useChainId();

    const { data: client } = useConnectorClient({
        config: wagmiConfig,
        chainId,
    });
    
    const publicClient = usePublicClient({
        config: wagmiConfig,
        chainId
    })

    const provider = useMemo(() => (client ? clientToWeb3Provider(client) : publicClient && clientToJsonRpcProvider(publicClient)), [client?.key]);

    return provider;
}
