import { farmingCenterABI } from '@/generated';
import { MaxUint128 } from '@cryptoalgebra/sdk';
import { Address, encodeFunctionData } from 'viem';
import { isSameRewards } from './isSameRewards';

export function getRewardsCalldata({
    rewardToken,
    bonusRewardToken,
    pool,
    nonce,
    tokenId,
    account,
}: {
    rewardToken: Address;
    bonusRewardToken: Address;
    pool: Address;
    nonce: bigint;
    tokenId: bigint;
    account: Address;
}): Address[] {
    const collectRewardsCalldata = encodeFunctionData({
        abi: farmingCenterABI,
        functionName: 'collectRewards',
        args: [
            {
                rewardToken,
                bonusRewardToken,
                pool,
                nonce,
            },
            tokenId,
        ],
    });

    const rewardClaimCalldata = encodeFunctionData({
        abi: farmingCenterABI,
        functionName: 'claimReward',
        args: [rewardToken, account, BigInt(MaxUint128)],
    });

    const bonusRewardClaimCalldata = encodeFunctionData({
        abi: farmingCenterABI,
        functionName: 'claimReward',
        args: [bonusRewardToken, account, BigInt(MaxUint128)],
    });

    let calldata;

    const isSameReward = isSameRewards(rewardToken, bonusRewardToken);

    if (isSameReward) {
        calldata = [
            collectRewardsCalldata,
            rewardClaimCalldata,
        ];
    } else {
        calldata = [
            collectRewardsCalldata, 
            rewardClaimCalldata,
            bonusRewardClaimCalldata,
        ];
    }

    return calldata;
}

export function getUnclaimedRewardsCalldata({
    rewards,
    account,
}: {
    rewards: Address[];
    account: Address;
}): Address[] {

    const rewardsSet = new Set(rewards)

    const calldata: Address[] = []

    for (const reward of rewardsSet.keys()) {
        calldata.push(
            encodeFunctionData({
                abi: farmingCenterABI,
                functionName: 'claimReward',
                args: [reward, account, BigInt(MaxUint128)],
            })
        )
    }

    return calldata;
}