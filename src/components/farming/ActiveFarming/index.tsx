import React, { useEffect, useState } from 'react';
import { SelectPositionFarmModal } from '@/components/modals/SelectPositionFarmModal';
import { isSameRewards } from '@/utils/farming/isSameRewards';
import { Deposit } from '@/graphql/generated/graphql';
import { Farming } from '@/types/farming-info';
import { Button } from '@/components/ui/button';
import CardInfo from '@/components/common/CardInfo';
import { formatUnits } from 'viem';
import { getFarmingRewards } from '@/utils/farming/getFarmingRewards';
import useFarmIntegralActions from '@/hooks/farming/useFarmIntegralActions';
import { FormattedPosition } from '@/types/formatted-position';
import CurrencyLogo from '@/components/common/CurrencyLogo';
import { useCurrency } from '@/hooks/common/useCurrency';

interface ActiveFarmingProps {
    farming: Farming;
    deposits: Deposit[];
    positionsData: FormattedPosition[];
}

const ActiveFarming = ({
    farming,
    deposits,
    positionsData,
}: ActiveFarmingProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [rewardEarned, setRewardEarned] = useState<bigint>(0n);
    const [bonusRewardEarned, setBonusRewardEarned] = useState<bigint>(0n);

    const isSameReward = isSameRewards(
        farming.farming.rewardToken,
        farming.farming.bonusRewardToken
    );

    const rewardTokenCurrency = useCurrency(farming.farming.rewardToken);
    const bonusRewardTokenCurrency = useCurrency(
        farming.farming.bonusRewardToken
    );

    const formattedRewardEarned = Number(
        formatUnits(rewardEarned, farming.rewardToken.decimals)
    );

    const formattedBonusRewardEarned = Number(
        formatUnits(bonusRewardEarned, farming.bonusRewardToken.decimals)
    );

    const TVL = deposits.reduce((acc, deposit) => {
        const currentFormattedPosition = positionsData.find(
            (position) => Number(position.id) === Number(deposit.id)
        );
        if (deposit.eternalFarming !== null && currentFormattedPosition) {
            return acc + currentFormattedPosition.liquidityUSD;
        } else {
            return acc;
        }
    }, 0);

    const formattedTVL = TVL.toFixed(2);

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

    // collectRewards query to active farming for all positions
    useEffect(() => {
        const promises: Promise<{
            reward: bigint;
            bonusReward: bigint;
        }>[] = [];
        deposits.forEach((deposit) => {
            if (deposit.eternalFarming !== null) {
                promises.push(
                    getFarmingRewards({
                        rewardToken: farming.farming.rewardToken,
                        bonusRewardToken: farming.farming.bonusRewardToken,
                        pool: farming.farming.pool,
                        nonce: farming.farming.nonce,
                        tokenId: BigInt(deposit.id),
                    })
                );
            }
        });
        if (promises.length === 0) return;
        Promise.all(promises).then((rewards) => {
            rewards.forEach((reward) => {
                setRewardEarned((prev) => prev + reward.reward);
                setBonusRewardEarned((prev) => prev + reward.bonusReward);
            });
        });
    }, []);

    const { onHarvestAll } = useFarmIntegralActions({
        tokenId: BigInt(deposits[2].id),
        rewardToken: farming.farming.rewardToken,
        bonusRewardToken: farming.farming.bonusRewardToken,
        pool: farming.farming.pool,
        nonce: farming.farming.nonce,
    });

    const handleHarvestAll = async () => {
        if (isLoading) return;
        setIsLoading(true);
        await onHarvestAll(deposits);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col w-full p-8 gap-8">
            <div className="flex w-full gap-8">
                <div className="flex w-1/2 gap-8">
                    <CardInfo className="w-full" title="APR">
                        <p className="text-green-300">45%</p>
                    </CardInfo>
                    <CardInfo className="w-full" title="TVL">
                        <p className="text-purple-300">${formattedTVL}</p>
                    </CardInfo>
                </div>

                <CardInfo
                    additional={
                        !isSameReward
                            ? `${formattedRewardEarned.toFixed(0)} ${
                                  farming.rewardToken.symbol
                              } + ${formattedBonusRewardEarned.toFixed(0)} ${
                                  farming.bonusRewardToken.symbol
                              }`
                            : ''
                    }
                    className="w-1/2"
                    title="EARNED"
                >
                    <p className="text-cyan-300">
                        ${formattedRewardEarned + formattedBonusRewardEarned}
                    </p>
                </CardInfo>
            </div>

            <CardInfo title="Rewards">
                <div className="flex gap-12 h-12">
                    <div className="flex gap-4 items-center">
                        <CurrencyLogo
                            size={32}
                            currency={rewardTokenCurrency}
                        />
                        <p>
                            {rewardRatePerDay +
                                ' ' +
                                farming.rewardToken.symbol}{' '}
                            / day
                        </p>
                    </div>
                    {bonusRewardRatePerDay !== 0 && (
                        <div className="flex gap-4 items-center">
                            <CurrencyLogo
                                size={32}
                                currency={bonusRewardTokenCurrency}
                            />
                            <p>
                                {bonusRewardRatePerDay}{' '}
                                {farming.bonusRewardToken.symbol} / day
                            </p>
                        </div>
                    )}
                </div>
            </CardInfo>

            <div className="w-full flex gap-8">
                <Button
                    disabled={
                        (formattedRewardEarned === 0 &&
                            formattedBonusRewardEarned === 0) ||
                        isLoading
                    }
                    onClick={handleHarvestAll}
                    className="w-1/2"
                >
                    {isLoading ? 'Harvesting...' : 'Collect Rewards'}
                </Button>
                <SelectPositionFarmModal
                    positions={deposits}
                    farming={farming}
                    positionsData={positionsData}
                />
            </div>
        </div>
    );
};

export default ActiveFarming;
