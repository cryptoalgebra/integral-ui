import { infoClient, blocksClient, farmingClient, limitOrderClient } from "@/graphql/clients";

export function useClients() {
    return {
        infoClient,
        blocksClient,
        farmingClient,
        limitOrderClient,
    };
}
