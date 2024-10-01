import { ADDRESS_ZERO } from '@cryptoalgebra/sdk';
import { Address } from 'viem';

export const isSameRewards = (
    rewardToken: Address,
    bonusRewardToken: Address
): boolean => {
    return (
        rewardToken.toLowerCase() === bonusRewardToken.toLowerCase() ||
        bonusRewardToken === ADDRESS_ZERO
    );
};
