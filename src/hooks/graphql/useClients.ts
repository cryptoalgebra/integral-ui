import { infoClient, blocksClient, farmingClient, limitOrderClient } from "@/graphql/clients";
import { useChainId } from "wagmi";

export function useClients() {
    const chainId = useChainId();

    return {
        infoClient: infoClient[chainId],
        blocksClient: blocksClient[chainId],
        farmingClient: farmingClient[chainId],
        limitOrderClient: limitOrderClient[chainId],
    };
}
