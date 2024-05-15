import { Deposit } from "@/graphql/generated/graphql";
import { Farming } from "@/types/farming-info";
import { getFarmingRewards } from "@/utils/farming/getFarmingRewards";
import { useCallback, useEffect, useState } from "react";
import { useRewardEarnedUSD } from "./useRewardEarnedUSD";
import { formatUnits } from "viem";
import { formatAmount } from "@/utils/common/formatAmount";

export function useFarmingRewardsEarned({ farming, deposits }: { farming: Farming; deposits: Deposit[] }) {
    const [rewardEarned, setRewardEarned] = useState<bigint>(0n);
    const [bonusRewardEarned, setBonusRewardEarned] = useState<bigint>(0n);

    const fetchAllRewards = useCallback(() => {
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
    }, [deposits, farming]);

    const formattedRewardEarned = Number(formatUnits(rewardEarned, farming.rewardToken.decimals));

    const formattedBonusRewardEarned = Number(formatUnits(bonusRewardEarned, farming.bonusRewardToken?.decimals));

    const formattedTotalEarned = formattedRewardEarned + formattedBonusRewardEarned;

    const rewardEarnedUSD = useRewardEarnedUSD({
        token: farming.rewardToken,
        reward: rewardEarned,
    });

    const bonusRewardEarnedUSD = useRewardEarnedUSD({
        token: farming.bonusRewardToken,
        reward: bonusRewardEarned,
    });

    const totalEarnedUSD = (rewardEarnedUSD + bonusRewardEarnedUSD).toFixed(4);

    useEffect(() => {
        fetchAllRewards();
    }, [fetchAllRewards]);

    return {
        rewardEarned: formatAmount(formattedRewardEarned.toString(), 2),
        bonusRewardEarned: formatAmount(formattedBonusRewardEarned.toString(), 2),
        totalEarned: formatAmount(formattedTotalEarned.toString(), 2),
        totalEarnedUSD,
        refetch: fetchAllRewards,
    };
}
