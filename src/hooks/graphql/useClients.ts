import { infoClient, blocksClient, farmingClient } from '@/graphql/clients';

export function useClients() {
    return {
        infoClient,
        blocksClient,
        farmingClient,
    };
}
