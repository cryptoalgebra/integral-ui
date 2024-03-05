import React from 'react';
import { SelectPositionFarmModal } from '@/components/modals/SelectPositionFarmModal';
import { Farming } from '../Farmings';
import { isSameRewards } from '@/utils/farming/isSameRewards';
import { Deposit } from '@/graphql/generated/graphql';

interface ActiveFarmingProps {
    farming: Farming;
    deposits: Deposit[];
}

const ActiveFarming = ({ farming, deposits }: ActiveFarmingProps) => {
    const isSameReward = farming ? isSameRewards(farming?.farming) : false;

    return (
        <div className="flex flex-col w-1/2 h-64 border border-white p-12">
            Active Farm
            <div className="flex flex-col gap-2 mb-2">
                <p className="bg-black w-full rounded-md ">APR - </p>
                {isSameReward ? (
                    <>
                        <p className="bg-black w-full rounded-md ">
                            Token - {farming?.rewardToken?.name}
                        </p>
                        <p className="bg-black w-full rounded-md ">
                            Reward Pool - {farming?.farming?.reward / 10 ** 18}
                        </p>
                    </>
                ) : (
                    <>
                        <p className="bg-black w-full rounded-md ">
                            Token - {farming?.rewardToken?.name}
                        </p>
                        <p className="bg-black w-full rounded-md ">
                            Reward - {farming?.farming?.reward / 10 ** 18}
                        </p>
                        <p className="bg-black w-full rounded-md ">
                            Bonus Token - {farming?.bonusRewardToken?.name}
                        </p>
                        <p className="bg-black w-full rounded-md ">
                            Bonus Reward -{' '}
                            {farming?.farming?.bonusReward / 10 ** 18}
                        </p>
                    </>
                )}
            </div>
            <SelectPositionFarmModal positions={deposits} />
        </div>
    );
};

export default ActiveFarming;
