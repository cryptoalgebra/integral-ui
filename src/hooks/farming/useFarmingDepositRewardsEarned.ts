import { getFarmingRewards } from "@/utils/farming/getFarmingRewards";
import { useCallback, useEffect, useState } from "react";
import { useRewardEarnedUSD } from "./useRewardEarnedUSD";
import { formatUnits } from "viem";
import { EternalFarming, useSingleTokenQuery } from "@/graphql/generated/graphql";

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

    console.log(rewardEarned, bonusRewardEarned);

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
        rewardEarned: formattedRewardEarned === 0 ? "0" : formattedRewardEarned < 0.01 ? "<0.01" : formattedRewardEarned.toFixed(2),
        bonusRewardEarned:
            formattedBonusRewardEarned === 0 ? "0" : formattedBonusRewardEarned < 0.01 ? "<0.01" : formattedBonusRewardEarned.toFixed(2),
        rewardEarnedUSD,
        bonusRewardEarnedUSD,
        totalEarned: formattedTotalEarned === 0 ? "0" : formattedTotalEarned < 0.01 ? "<0.01" : formattedTotalEarned.toFixed(2),
        totalEarnedUSD,
        refetch: fetchDepositRewards,
    };
}
