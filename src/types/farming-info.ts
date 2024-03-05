import {
    EternalFarming,
    SinglePoolQuery,
    SingleTokenQuery,
} from '@/graphql/generated/graphql';

export interface Farming {
    farming: EternalFarming;
    rewardToken: SingleTokenQuery['token'];
    bonusRewardToken: SingleTokenQuery['token'];
    pool: SinglePoolQuery['pool'];
}
