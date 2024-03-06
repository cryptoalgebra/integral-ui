import React from 'react';
import { SelectPositionFarmModal } from '@/components/modals/SelectPositionFarmModal';
import { isSameRewards } from '@/utils/farming/isSameRewards';
import { Deposit } from '@/graphql/generated/graphql';
import { Farming } from '@/types/farming-info';
import { Button } from '@/components/ui/button';
import CardInfo from '@/components/common/CardInfo';
import { formatUnits } from 'viem';

interface ActiveFarmingProps {
    farming: Farming;
    deposits: Deposit[];
}

const ActiveFarming = ({ farming, deposits }: ActiveFarmingProps) => {
    const isSameReward = isSameRewards(farming.farming);

    const rewardRatePerDay =
        Number(
            formatUnits(
                farming.farming.rewardRate,
                farming.rewardToken.decimals
            )
        ) *
        60 *
        60 *
        24;

    const bonusRewardRatePerDay = isSameReward
        ? 0
        : Number(
              formatUnits(
                  farming.farming.bonusRewardRate,
                  farming.bonusRewardToken.decimals
              )
          ) *
          60 *
          60 *
          24;

    return (
        <div className="flex flex-col w-full p-8 gap-8">
            <div className="flex w-full gap-8">
                <div className="flex w-1/2 gap-8">
                    <CardInfo className="w-full" title="APR">
                        <p className="text-green-300">45%</p>
                    </CardInfo>
                    <CardInfo className="w-full" title="TVL">
                        <p className="text-purple-300">$100</p>
                    </CardInfo>
                </div>
                <CardInfo
                    additional="6 USDC + 6 USDT"
                    className="w-1/2"
                    title="EARNED"
                >
                    <p className="text-cyan-300">$12</p>
                </CardInfo>
            </div>

            <CardInfo title="Rewards">
                <div className="flex gap-12">
                    <p>
                        {rewardRatePerDay + ' ' + farming.rewardToken.symbol} /
                        day
                    </p>
                    {bonusRewardRatePerDay !== 0 && (
                        <p>
                            {bonusRewardRatePerDay}{' '}
                            {farming.bonusRewardToken.symbol} / day
                        </p>
                    )}
                </div>
            </CardInfo>

            <div className="w-full flex gap-8">
                <Button className="w-1/2">Collect Rewards</Button>
                <SelectPositionFarmModal
                    positions={deposits}
                    farming={farming}
                />
            </div>
        </div>
    );
};

export default ActiveFarming;
