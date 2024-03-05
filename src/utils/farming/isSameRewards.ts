import { EternalFarming } from '@/graphql/generated/graphql';

export const isSameRewards = (farming: EternalFarming) => {
    return farming.rewardToken === farming.bonusRewardToken ? true : false;
};
