import { farmingCenterABI } from '@/generated';
import { MaxUint128 } from '@cryptoalgebra/integral-sdk';
import { encodeFunctionData } from 'viem';

export function getRewardsCalldata({
    rewardToken,
    bonusRewardToken,
    pool,
    nonce,
    tokenId,
    account,
}: {
    rewardToken: `0x${string}`;
    bonusRewardToken: `0x${string}`;
    pool: `0x${string}`;
    nonce: bigint;
    tokenId: bigint;
    account: `0x${string}`;
}): `0x${string}`[] {
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

    if (rewardToken.toLowerCase() !== bonusRewardToken.toLowerCase()) {
        calldata = [
            collectRewardsCalldata,
            rewardClaimCalldata,
            bonusRewardClaimCalldata,
        ];
    } else {
        calldata = [collectRewardsCalldata, rewardClaimCalldata];
    }

    return calldata;
}
