import { infoClient, farmingClient, limitOrderClient, uniswapInfoClient } from "@/graphql/clients";
import { useChainId } from "@/hooks/common/useChainId";

export function useClients() {
    const chainId = useChainId();

    return {
        infoClient: infoClient[chainId],
        uniswapInfoClient,
        farmingClient: farmingClient[chainId],
        limitOrderClient: limitOrderClient[chainId] };
}
