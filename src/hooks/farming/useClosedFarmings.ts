import {
    SinglePoolQuery,
    EternalFarming,
    useEternalFarmingsQuery,
    useDepositsQuery,
} from '@/graphql/generated/graphql';
import { useEffect, useState } from 'react';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { useClients } from '../graphql/useClients';

export function useClosedFarmings({
    poolId,
    poolInfo,
}: {
    poolId: Address;
    poolInfo: SinglePoolQuery | undefined;
}) {
    const { address: account } = useAccount();

    const [closedFarmings, setClosedFarmings] = useState<
        EternalFarming[] | null
    >();

    const { farmingClient } = useClients();

    const { data: farmings, loading: isLoading } = useEternalFarmingsQuery({
        variables: {
            pool: poolId,
        },
        client: farmingClient,
        skip: !poolInfo,
    });

    const filteredFarmings = farmings?.eternalFarmings.filter(
        (farming) => farming.isDeactivated
    );

    const { data: deposits } = useDepositsQuery({
        variables: {
            owner: account,
            pool: poolId,
        },
        client: farmingClient,
        skip: !poolInfo,
    });

    useEffect(() => {
        if (!farmings?.eternalFarmings) return;
        if (!poolInfo) return;
        if (!filteredFarmings) {
            console.log('Closed farmings not found');
            setClosedFarmings(null);
            return;
        }
        setClosedFarmings(closedFarmings);
    }, [deposits, farmings, poolInfo, closedFarmings]);

    return {
        closedFarmings,
        deposits,
        isLoading,
    };
}
