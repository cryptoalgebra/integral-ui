import { getFarmingCenter } from '@/generated';

export async function getFarmingRewards({
    rewardToken,
    bonusRewardToken,
    pool,
    nonce,
    tokenId,
}: {
    rewardToken: `0x${string}`;
    bonusRewardToken: `0x${string}`;
    pool: `0x${string}`;
    nonce: bigint;
    tokenId: bigint;
}): Promise<{ reward: bigint; bonusReward: bigint }> {
    try {
        const farmingCenter = getFarmingCenter({});
        const {
            result: [reward, bonusReward],
        } = await farmingCenter.simulate.collectRewards([
            {
                rewardToken,
                bonusRewardToken,
                pool,
                nonce,
            },
            tokenId,
        ]);
        return {
            reward,
            bonusReward,
        };
    } catch (e) {
        console.error(e);
        return {
            reward: 0n,
            bonusReward: 0n,
        };
    }
}
