import { useEffect, useState } from 'react';
import { SelectPositionFarmModal } from '@/components/modals/SelectPositionFarmModal';
import { isSameRewards } from '@/utils/farming/isSameRewards';
import { Deposit } from '@/graphql/generated/graphql';
import { Farming } from '@/types/farming-info';
import { Button } from '@/components/ui/button';
import CardInfo from '@/components/common/CardInfo';
import { formatUnits } from 'viem';
import { getFarmingRewards } from '@/utils/farming/getFarmingRewards';
import { FormattedPosition } from '@/types/formatted-position';
import CurrencyLogo from '@/components/common/CurrencyLogo';
import { useCurrency } from '@/hooks/common/useCurrency';
import { useAccount } from 'wagmi';
import { useFarmHarvestAll } from '@/hooks/farming/useFarmHarvest';
import Loader from '@/components/common/Loader';
import { ADDRESS_ZERO } from '@cryptoalgebra/integral-sdk';
import { useRewardEarnedUSD } from '@/hooks/farming/useRewardEarnedUSD';

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
    const { address: account } = useAccount();

    const [rewardEarned, setRewardEarned] = useState<bigint>(0n);
    const [bonusRewardEarned, setBonusRewardEarned] = useState<bigint>(0n);

    const isSameReward = isSameRewards(
        farming.farming.rewardToken,
        farming.farming.bonusRewardToken
    );

    const formattedRewardEarned = Number(
        formatUnits(rewardEarned, farming.rewardToken.decimals)
    );

    const formattedBonusRewardEarned = Number(
        formatUnits(bonusRewardEarned, farming.bonusRewardToken?.decimals)
    );

    const rewardEarnedUSD = useRewardEarnedUSD({
        token: farming.rewardToken,
        reward: rewardEarned,
    });

    const bonusRewardEarnedUSD = useRewardEarnedUSD({
        token: farming.bonusRewardToken,
        reward: bonusRewardEarned,
    });

    const rewardTokenCurrency = useCurrency(farming.farming.rewardToken);
    const bonusRewardTokenCurrency = useCurrency(
        farming.farming.bonusRewardToken
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

    const bonusRewardRatePerDay =
        Number(
            formatUnits(
                farming.farming.bonusRewardRate,
                farming.bonusRewardToken?.decimals
            )
        ) *
        60 *
        60 *
        24;

    const { isLoading, onHarvestAll, isSuccess } = useFarmHarvestAll(
        {
            rewardToken: farming.farming.rewardToken,
            bonusRewardToken: farming.farming.bonusRewardToken,
            pool: farming.farming.pool,
            nonce: farming.farming.nonce,
            account: account ?? ADDRESS_ZERO,
        },
        deposits
    );

    const handleHarvestAll = async () => {
        if (isLoading || !onHarvestAll) return;
        onHarvestAll();
    };

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
            setRewardEarned(0n);
            setBonusRewardEarned(0n);
            rewards.forEach((reward) => {
                setRewardEarned((prev) => prev + reward.reward);
                setBonusRewardEarned((prev) => prev + reward.bonusReward);
            });
        });
    }, [deposits, farming, isSuccess]);

    return (
        <div className="flex items-center justify-center min-h-[377px] pb-2 bg-card border border-card-border/60 rounded-3xl mt-8">
            <div className="flex flex-col w-full max-sm:p-6 p-8 gap-8">
                <div className="flex max-sm:flex-col w-full gap-8">
                    <div className="flex max-xs:flex-col w-full gap-8">
                        <CardInfo className="w-1/2 max-xs:w-full" title="APR">
                            <p className="text-green-300">45%</p>
                        </CardInfo>
                        <CardInfo className="w-1/2 max-xs:w-full" title="TVL">
                            <p className="text-purple-300">${formattedTVL}</p>
                        </CardInfo>
                    </div>

                    <CardInfo
                        additional={
                            !isSameReward
                                ? `${
                                      formattedRewardEarned.toFixed(2) ===
                                      '0.00'
                                          ? '<0.01'
                                          : formattedRewardEarned.toFixed(2)
                                  } ${farming.rewardToken.symbol} + ${
                                      formattedBonusRewardEarned.toFixed(2) ===
                                      '0.00'
                                          ? '<0.01'
                                          : formattedBonusRewardEarned.toFixed(
                                                2
                                            )
                                  } ${farming.bonusRewardToken?.symbol}`
                                : ''
                        }
                        className="w-full"
                        title="EARNED"
                    >
                        <p className="text-cyan-300">
                            $
                            {(rewardEarnedUSD + bonusRewardEarnedUSD).toFixed(
                                4
                            )}
                        </p>
                    </CardInfo>
                </div>

                <CardInfo title="Rewards">
                    <div className="flex gap-12 min-h-12">
                        <div className="flex gap-4 items-center">
                            {isSameReward ? (
                                <>
                                    <CurrencyLogo
                                        size={32}
                                        currency={rewardTokenCurrency}
                                    />
                                    <p>
                                        {`${(
                                            rewardRatePerDay +
                                            bonusRewardRatePerDay
                                        ).toFixed(2)} ${
                                            farming.rewardToken.symbol
                                        } / day`}
                                    </p>
                                </>
                            ) : (
                                <div className="flex w-full gap-4 max-md:flex-col">
                                    <div className="flex w-fit h-fit gap-4 items-center">
                                        <CurrencyLogo
                                            className="h-fit"
                                            size={32}
                                            currency={rewardTokenCurrency}
                                        />
                                        <p>
                                            {`${
                                                rewardRatePerDay.toFixed(2) ===
                                                '0.00'
                                                    ? '<0.01'
                                                    : rewardRatePerDay.toFixed(
                                                          2
                                                      )
                                            } ${
                                                farming.rewardToken.symbol
                                            } / day`}
                                        </p>
                                    </div>
                                    {bonusRewardRatePerDay > 0 && (
                                        <div className="flex w-fit h-fit gap-4 items-center">
                                            <CurrencyLogo
                                                className="h-fit"
                                                size={32}
                                                currency={
                                                    bonusRewardTokenCurrency
                                                }
                                            />
                                            <p>
                                                {`${
                                                    bonusRewardRatePerDay.toFixed(
                                                        2
                                                    ) === '0.00'
                                                        ? '<0.01'
                                                        : bonusRewardRatePerDay.toFixed(
                                                              2
                                                          )
                                                } ${
                                                    farming.bonusRewardToken
                                                        ?.symbol
                                                } / day`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardInfo>

                <div className="w-full flex gap-8">
                    <Button
                        disabled={
                            (rewardEarnedUSD === 0 &&
                                bonusRewardEarnedUSD === 0) ||
                            isLoading
                        }
                        onClick={handleHarvestAll}
                        className="w-1/2"
                    >
                        {isLoading ? <Loader /> : 'Collect Rewards'}
                    </Button>
                    <SelectPositionFarmModal
                        isHarvestLoading={isLoading}
                        positions={deposits}
                        farming={farming}
                        positionsData={positionsData}
                    />
                </div>
            </div>
        </div>
    );
};

export default ActiveFarming;
