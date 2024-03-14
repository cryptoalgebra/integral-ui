import { getFarmingCenter } from '@/generated';
import { Address } from 'viem';

export async function getFarmingRewards({
    rewardToken,
    bonusRewardToken,
    pool,
    nonce,
    tokenId,
}: {
    rewardToken: Address;
    bonusRewardToken: Address;
    pool: Address;
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
