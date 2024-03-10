export const isSameRewards = (
    rewardToken: `0x${string}`,
    bonusRewardToken: `0x${string}`
): boolean => {
    return rewardToken.toLowerCase() === bonusRewardToken.toLowerCase();
};
