import { DEFAULT_CHAIN_ID } from "@/constants/default-chain-id";
import { providers } from "ethers";
import { useMemo } from "react";
import useSWR from "swr";
import type { Chain, Client, Transport } from "viem";
import { useChainId, usePublicClient, WalletClient } from "wagmi";
import { getWalletClient } from "wagmi/actions";

export function clientToProvider(client: Client<Transport, Chain>): providers.JsonRpcProvider {
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

/** Action to convert a viem Client to an ethers.js Provider. */
export function useEthersProvider() {
    const chainId = useChainId();
    const client = usePublicClient({ chainId: chainId || DEFAULT_CHAIN_ID });

    return useMemo(() => {
        return clientToProvider(client);
    }, [client]);
}

export function walletToProvider(walletClient: WalletClient) {
    const { chain, transport } = walletClient;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new providers.Web3Provider(transport, network);
    return provider;
}

/** Action to convert a viem Client to an ethers.js Provider. */
export function useEthersSigner() {
    const chainId = useChainId();

    const { data: provider } = useSWR(["ethersProvider", chainId], async () => {
        const client = await getWalletClient({ chainId: chainId || DEFAULT_CHAIN_ID });
        if (!client) throw new Error("No wallet client");
        return walletToProvider(client);
    });

    return provider;
}
