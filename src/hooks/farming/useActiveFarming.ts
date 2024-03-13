import { Address, useAccount } from 'wagmi';
import { useClients } from '../graphql/useClients';
import { useEffect, useState } from 'react';
import {
    useDepositsQuery,
    useEternalFarmingsQuery,
    useSingleTokenQuery,
    SinglePoolQuery,
} from '@/graphql/generated/graphql';
import { Farming } from '@/types/farming-info';

export function useActiveFarming({
    poolId,
    poolInfo,
}: {
    poolId: Address;
    poolInfo: SinglePoolQuery | undefined;
}) {
    const { address: account } = useAccount();

    const [farmingInfo, setFarmingInfo] = useState<Farming | null>();

    const { farmingClient } = useClients();

    const { data: farmings, loading: isLoading } = useEternalFarmingsQuery({
        variables: {
            pool: poolId,
        },
        client: farmingClient,
        skip: !poolInfo,
    });

    const activeFarming = farmings?.eternalFarmings.filter(
        (farming) => !farming.isDeactivated
    )[0];

    const { data: rewardToken } = useSingleTokenQuery({
        skip: !activeFarming,
        variables: {
            tokenId: activeFarming?.rewardToken,
        },
    });

    const { data: bonusRewardToken } = useSingleTokenQuery({
        skip: !activeFarming,
        variables: {
            tokenId: activeFarming?.bonusRewardToken,
        },
    });

    const { data: deposits } = useDepositsQuery({
        variables: {
            owner: account,
            pool: poolId,
        },
        client: farmingClient,
        skip: !poolInfo,
        pollInterval: 5000,
    });

    useEffect(() => {
        if (!farmings?.eternalFarmings) return;
        if (!activeFarming) {
            console.log('Active farming not found');
            setFarmingInfo(null);
            return;
        }
        if (!poolInfo) return;
        if (!rewardToken) return;
        if (!bonusRewardToken) return;

        // ! disabled null check
        setFarmingInfo({
            farming: activeFarming,
            rewardToken: rewardToken.token!,
            bonusRewardToken: bonusRewardToken.token!,
            pool: poolInfo.pool,
        });
    }, [farmings, rewardToken, bonusRewardToken, poolInfo, activeFarming]);

    useEffect(() => {
        if (!farmingInfo) return;
        console.log('Active Farming - ', farmingInfo);
    }, [farmingInfo]);

    useEffect(() => {
        if (!deposits) return;
        console.log('Positions - ', deposits.deposits);
    }, [deposits]);

    return {
        farmingInfo,
        deposits,
        isLoading,
    };
}
