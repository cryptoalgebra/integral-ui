import { useEffect, useState } from 'react';
import { Farming } from '@/types/farming-info';
import { formatUnits } from 'viem';
import { ADDRESS_ZERO } from '@cryptoalgebra/integral-sdk';
import { useFarmHarvest } from '@/hooks/farming/useFarmHarvest';
import { useFarmUnstake } from '@/hooks/farming/useFarmStake';
import { useAccount } from 'wagmi';
import { getFarmingRewards } from '@/utils/farming/getFarmingRewards';
import { Button } from '@/components/ui/button';
import Loader from '@/components/common/Loader';
import { Deposit } from '@/graphql/generated/graphql';

interface CollectFarmingsProps {
    farming: Farming;
    selectedPosition: Deposit;
}

const CollectFarmings = ({
    farming,
    selectedPosition,
}: CollectFarmingsProps) => {
    const { address: account } = useAccount();

    const [rewardEarned, setRewardEarned] = useState<bigint>(0n);
    const [bonusRewardEarned, setBonusRewardEarned] = useState<bigint>(0n);

    const formattedRewardEarned = Number(
        formatUnits(rewardEarned, farming.rewardToken.decimals)
    );

    const formattedBonusRewardEarned = Number(
        formatUnits(bonusRewardEarned, farming.bonusRewardToken.decimals)
    );

    const farmingRewards = (
        formattedRewardEarned + formattedBonusRewardEarned
    ).toFixed(4);

    const farmingArgs = {
        tokenId: BigInt(selectedPosition.id),
        rewardToken: farming.farming.rewardToken,
        bonusRewardToken: farming.farming.bonusRewardToken,
        pool: farming.farming.pool,
        nonce: farming.farming.nonce,
        account: account ?? ADDRESS_ZERO,
    };

    const {
        onHarvest,
        isLoading: isHarvesting,
        isSuccess: isHarvested,
    } = useFarmHarvest(farmingArgs);

    const { onUnstake, isLoading: isUnstaking } = useFarmUnstake(farmingArgs);

    const handleUnstake = async () => {
        if (!account) return;
        if (!onUnstake) return;
        onUnstake();
    };

    const handleHarvest = async () => {
        if (!account) return;
        if (!onHarvest) return;
        onHarvest();
    };

    useEffect(() => {
        if (!account) return;
        getFarmingRewards(farmingArgs).then((rewards) => {
            setRewardEarned(rewards.reward);
            setBonusRewardEarned(rewards.bonusReward);
        });
    }, [farming, account, selectedPosition, isHarvested]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex w-full justify-between bg-card-dark p-4 rounded-xl">
                <div className="text-left">
                    <div className="font-bold text-xs">EARNED FARMINGS</div>
                    <div className="font-semibold text-2xl">
                        <span className="text-cyan-300 drop-shadow-cyan">
                            ${farmingRewards}
                        </span>
                    </div>
                </div>
                <Button
                    size={'md'}
                    disabled={isHarvesting || isUnstaking}
                    onClick={handleHarvest}
                >
                    {isHarvesting ? <Loader /> : 'Collect farmings'}
                </Button>
            </div>
            <Button
                onClick={handleUnstake}
                disabled={isUnstaking || isHarvesting}
            >
                {isUnstaking ? <Loader /> : 'Exit from farming'}
            </Button>
        </div>
    );
};

export default CollectFarmings;
