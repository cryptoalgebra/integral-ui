import { getFarmingRewards } from "@/utils/farming/getFarmingRewards";
import { useCallback, useEffect, useState } from "react";
import { useRewardEarnedUSD } from "./useRewardEarnedUSD";
import { formatUnits } from "viem";
import { EternalFarming, useSingleTokenQuery } from "@/graphql/generated/graphql";
import { formatAmount } from "@/utils/common/formatAmount";

export function useFarmingDepositRewardsEarned({ farming, positionId }: { farming: EternalFarming; positionId: bigint }) {
    const [rewardEarned, setRewardEarned] = useState<bigint>(0n);
    const [bonusRewardEarned, setBonusRewardEarned] = useState<bigint>(0n);

    const { data: rewardToken } = useSingleTokenQuery({
        variables: {
            tokenId: farming.rewardToken,
        },
    });

    const { data: bonusRewardToken } = useSingleTokenQuery({
        variables: {
            tokenId: farming.bonusRewardToken,
        },
    });

    const fetchDepositRewards = useCallback(() => {
        getFarmingRewards({
            tokenId: positionId,
            rewardToken: farming.rewardToken,
            bonusRewardToken: farming.bonusRewardToken,
            pool: farming.pool,
            nonce: farming.nonce,
        }).then((rewards) => {
            setRewardEarned(rewards.reward);
            setBonusRewardEarned(rewards.bonusReward);
        });
    }, [farming, positionId]);

    const formattedRewardEarned = rewardToken?.token ? Number(formatUnits(rewardEarned, rewardToken.token.decimals)) : 0;

    const formattedBonusRewardEarned = bonusRewardToken?.token
        ? Number(formatUnits(bonusRewardEarned, bonusRewardToken.token.decimals))
        : 0;

    const formattedTotalEarned = formattedRewardEarned + formattedBonusRewardEarned;

    const rewardEarnedUSD = useRewardEarnedUSD({
        token: rewardToken?.token,
        reward: rewardEarned,
    });

    const bonusRewardEarnedUSD = useRewardEarnedUSD({
        token: bonusRewardToken?.token,
        reward: bonusRewardEarned,
    });

    const totalEarnedUSD = (rewardEarnedUSD + bonusRewardEarnedUSD).toFixed(4);

    useEffect(() => {
        fetchDepositRewards();
    }, [fetchDepositRewards]);

    return {
        rewardEarned: formatAmount(formattedRewardEarned.toString(), 2),
        bonusRewardEarned: formatAmount(formattedBonusRewardEarned.toString(), 2),
        rewardEarnedUSD,
        bonusRewardEarnedUSD,
        totalEarned: formatAmount(formattedTotalEarned.toString(), 2),
        totalEarnedUSD,
        refetch: fetchDepositRewards,
    };
}
