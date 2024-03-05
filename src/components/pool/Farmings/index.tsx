import React, { useEffect, useState } from 'react';
import MyPositions from '../MyPositions';
import {
    useEternalFarmingsQuery,
    useSingleTokenQuery,
    useDepositsQuery,
    SinglePoolQuery,
    Deposit,
    EternalFarming,
    SingleTokenQuery,
} from '@/graphql/generated/graphql';
import { useClients } from '@/hooks/graphql/useClients';
import { Address, useAccount } from 'wagmi';
import { SelectPositionFarmModal } from '@/components/modals/SelectPositionFarmModal';
import { isSameRewards } from '@/utils/farming/isSameRewards';
import { Token } from 'graphql';
import ActiveFarming from '../ActiveFarming';
import FarmRewards from '../FarmRewards';
import ClosedFarmings from '../ClosedFarmings';

interface FarmingsProps {
    poolId: Address;
    poolInfo: SinglePoolQuery;
}

export interface Farming {
    farming: EternalFarming;
    rewardToken: SingleTokenQuery['token'];
    bonusRewardToken: SingleTokenQuery['token'];
    pool: SinglePoolQuery;
}

const Farmings = ({ poolId, poolInfo }: FarmingsProps) => {
    const { address: account } = useAccount();

    const [farmingInfo, setFarmingInfo] = useState<Farming>();

    const { farmingClient } = useClients();

    const { data: farmings, loading: isLoading } = useEternalFarmingsQuery({
        variables: {
            pool: poolId,
        },
        client: farmingClient,
    });

    const activeFarming = farmings?.eternalFarmings.filter(
        (farming) => !farming.isDeactivated
    )[0];

    const closedFarmings = farmings?.eternalFarmings.filter(
        (farming) => farming.isDeactivated
    );

    const { data: rewardToken } = useSingleTokenQuery({
        variables: {
            tokenId: activeFarming?.rewardToken,
        },
    });

    const { data: bonusRewardToken } = useSingleTokenQuery({
        variables: {
            tokenId: activeFarming?.bonusRewardToken,
        },
    });

    useEffect(() => {
        if (!farmings?.eternalFarmings || farmings.eternalFarmings.length === 0)
            return;
        if (!rewardToken || !bonusRewardToken || !poolInfo) return;

        if (!activeFarming) {
            console.error('Active farming not found');
        }

        setFarmingInfo({
            farming: { ...activeFarming },
            rewardToken: { ...rewardToken.token },
            bonusRewardToken: { ...bonusRewardToken.token },
            ...poolInfo,
        });
    }, [farmings, rewardToken, bonusRewardToken, poolInfo]);

    useEffect(() => {
        console.log(farmingInfo);
    }, [farmingInfo]);

    // All positions for current pool
    const { data: deposits } = useDepositsQuery({
        variables: {
            owner: account,
            pool: poolId,
        },
        client: farmingClient,
    });

    // useEffect(() => {
    //     if (!deposits) return;
    //     console.log(deposits);
    // }, [deposits]);

    return (
        <div className="flex min-h-[377px] pb-2 bg-card border border-card-border/60 rounded-3xl mt-8">
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <ActiveFarming
                        deposits={deposits && deposits.deposits}
                        farming={farmingInfo}
                    />
                    <FarmRewards />
                    <ClosedFarmings farmings={closedFarmings} />
                </>
            )}
        </div>
    );
};

export default Farmings;
