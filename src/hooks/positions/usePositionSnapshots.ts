import { usePositionSnapshotsQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";

export interface PositionSnapshot {
    id: string;
    depositedToken0: string;
    depositedToken1: string;
    withdrawnToken0: string;
    withdrawnToken1: string;
    collectedFeesToken0: string;
    collectedFeesToken1: string;
    timestamp: string;
    transaction?: {
        id: string;
    } | null;
}

export function usePositionSnapshots(tokenId?: string | number) {
    const { infoClient } = useClients();
    const resolvedTokenId = tokenId?.toString();

    const { data, loading, error, refetch } = usePositionSnapshotsQuery({
        variables: { tokenId: resolvedTokenId },
        skip: !resolvedTokenId,
        client: infoClient,
    });

    return {
        snapshots: data?.positionSnapshots ?? [],
        loading,
        error,
        refetch,
    };
}
