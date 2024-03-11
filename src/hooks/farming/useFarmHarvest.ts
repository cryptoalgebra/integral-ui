import { FARMING_CENTER } from '@/constants/addresses';
import { farmingCenterABI } from '@/generated';
import { getRewardsCalldata } from '@/utils/farming/getRewardsCalldata';
import { Address, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useTransitionAwait } from '../common/useTransactionAwait';
import { encodeFunctionData } from 'viem';
import { Deposit } from '@/graphql/generated/graphql';

export function useFarmHarvest({
    tokenId,
    rewardToken,
    bonusRewardToken,
    pool,
    nonce,
    account,
}: {
    tokenId: bigint;
    rewardToken: Address;
    bonusRewardToken: Address;
    pool: Address;
    nonce: bigint;
    account: Address;
}) {
    const calldata = getRewardsCalldata({
        rewardToken,
        bonusRewardToken,
        pool,
        nonce,
        tokenId,
        account,
    });

    const { config } = usePrepareContractWrite({
        address: account ? FARMING_CENTER : undefined,
        abi: farmingCenterABI,
        functionName: 'multicall',
        args: [calldata],
    });

    const { data: data, writeAsync: onHarvest } = useContractWrite(config);

    const { isLoading, isSuccess } = useTransitionAwait(
        data?.hash,
        `Harvest Position #${tokenId}`
    );

    return {
        isLoading,
        isSuccess,
        onHarvest,
    };
}

export function useFarmHarvestAll(
    {
        rewardToken,
        bonusRewardToken,
        pool,
        nonce,
        account,
    }: {
        rewardToken: Address;
        bonusRewardToken: Address;
        pool: Address;
        nonce: bigint;
        account: Address;
    },
    deposits: Deposit[]
) {
    const calldatas: Address[] = [];

    deposits.forEach((deposit) => {
        if (deposit.eternalFarming !== null) {
            const rewardsCalldata = getRewardsCalldata({
                rewardToken,
                bonusRewardToken,
                pool,
                nonce,
                tokenId: BigInt(deposit.id),
                account,
            });

            const calldata = encodeFunctionData({
                abi: farmingCenterABI,
                functionName: 'multicall',
                args: [rewardsCalldata],
            });
            calldatas.push(calldata);
        }
    });

    const { config } = usePrepareContractWrite({
        address: FARMING_CENTER,
        abi: farmingCenterABI,
        functionName: 'multicall',
        args: [calldatas],
    });

    const { data: data, writeAsync: onHarvestAll } = useContractWrite(config);

    const { isLoading, isSuccess } = useTransitionAwait(
        data?.hash,
        `Harvest All Positions`
    );

    return {
        isLoading,
        isSuccess,
        onHarvestAll,
    };
}
