import { infoClient, limitOrderClient, blocksClient } from "@/graphql/clients";

export function useClients() {

    return {
        infoClient,
        limitOrderClient,
        blocksClient
    }

}