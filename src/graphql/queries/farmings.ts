import { gql } from '@apollo/client';

export const ETERNAL_FARMINGS = gql`
    query EternalFarmings($pool: Bytes) {
        eternalFarmings(where: { pool: $pool }) {
            id
            reward
            bonusReward
            rewardRate
            bonusRewardRate
            rewardToken
            bonusRewardToken
            isDeactivated
            nonce
            minRangeLength
            virtualPool
            pool
        }
    }
`;

export const DEPOSITS = gql`
    query Deposits($owner: Bytes, $pool: Bytes) {
        deposits(where: { owner: $owner, pool: $pool }) {
            eternalFarming
            id
            liquidity
            owner
            pool
            rangeLength
        }
    }
`;
