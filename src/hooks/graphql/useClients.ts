import { infoClient, farmingClient, limitOrderClient, uniswapInfoClient, blocksClient, predictionClient } from "@/graphql/clients";
import { useChainId } from "wagmi";

export function useClients() {
    const chainId = useChainId();

    return {
        infoClient: infoClient[chainId],
        uniswapInfoClient,
        farmingClient: farmingClient[chainId],
        limitOrderClient: limitOrderClient[chainId],
        blocksClient: blocksClient[chainId],
        predictionClient: predictionClient[chainId]
    };
}
