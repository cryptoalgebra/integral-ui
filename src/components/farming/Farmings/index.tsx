import React, { useEffect, useState } from 'react';
import {
    useEternalFarmingsQuery,
    useSingleTokenQuery,
    useDepositsQuery,
    SinglePoolQuery,
} from '@/graphql/generated/graphql';
import { useClients } from '@/hooks/graphql/useClients';
import { Address, useAccount } from 'wagmi';
import ActiveFarming from '../ActiveFarming';
import { Farming } from '@/types/farming-info';
import { Loader } from 'lucide-react';
import { FormattedPosition } from '@/types/formatted-position';

interface FarmingsProps {
    poolId: Address;
    poolInfo: SinglePoolQuery;
    positionsData: FormattedPosition[];
}

const Farmings = ({ poolId, poolInfo, positionsData }: FarmingsProps) => {
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

    useEffect(() => {
        if (!farmings?.eternalFarmings || farmings.eternalFarmings.length === 0)
            return;
        if (!rewardToken || !bonusRewardToken || !poolInfo) return;

        if (!activeFarming) {
            console.error('Active farming not found');
            return;
        }

        // ! disabled null check
        setFarmingInfo({
            farming: activeFarming,
            rewardToken: rewardToken.token!,
            bonusRewardToken: bonusRewardToken.token!,
            pool: poolInfo.pool,
        });
    }, [farmings, rewardToken, bonusRewardToken, poolInfo]);

    useEffect(() => {
        if (!farmingInfo) return;
        console.log('Active Farming - ', farmingInfo);
    }, [farmingInfo]);

    // All positions for current pool
    const { data: deposits } = useDepositsQuery({
        variables: {
            owner: account,
            pool: poolId,
        },
        client: farmingClient,
    });

    useEffect(() => {
        if (!deposits) return;
        console.log('Positions - ', deposits.deposits);
    }, [deposits]);

    return (
        <div className="flex items-center justify-center min-h-[377px] pb-2 bg-card border border-card-border/60 rounded-3xl mt-8">
            {isLoading || !deposits || !farmingInfo || !closedFarmings ? (
                <Loader />
            ) : (
                <>
                    <ActiveFarming
                        deposits={deposits && deposits.deposits}
                        farming={farmingInfo}
                        positionsData={positionsData}
                    />
                    {/* <ClosedFarmings farmings={closedFarmings} /> */}
                </>
            )}
        </div>
    );
};

export default Farmings;
