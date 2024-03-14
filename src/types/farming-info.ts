import {
    EternalFarming,
    SinglePoolQuery,
    TokenFieldsFragment,
} from '@/graphql/generated/graphql';

export interface Farming {
    farming: EternalFarming;
    rewardToken: TokenFieldsFragment;
    bonusRewardToken: TokenFieldsFragment | null;
    pool: SinglePoolQuery['pool'];
}
