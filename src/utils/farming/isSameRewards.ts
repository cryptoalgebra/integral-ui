import { Address } from 'viem';

export const isSameRewards = (
    rewardToken: Address,
    bonusRewardToken: Address
): boolean => {
    return rewardToken.toLowerCase() === bonusRewardToken.toLowerCase();
};
