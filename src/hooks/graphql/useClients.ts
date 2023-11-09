import { infoClient, blocksClient } from "@/graphql/clients";

export function useClients() {

    return {
        infoClient,
        blocksClient
    }

}