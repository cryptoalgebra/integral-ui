import { FARMING_CENTER } from '@/constants/addresses';
import { farmingCenterABI } from '@/generated';
import { Address, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useTransactionAwait } from '../common/useTransactionAwait';
import { encodeFunctionData } from 'viem';
import { MaxUint128 } from '@cryptoalgebra/integral-sdk';
import { useFarmCheckApprove } from './useFarmCheckApprove';
import { useEffect, useState } from 'react';
import { farmingClient } from '@/graphql/clients';
import { Deposit } from '@/graphql/generated/graphql';
import { TransactionType } from '@/state/pendingTransactionsStore';

export function useFarmStake({
    tokenId,
    rewardToken,
    bonusRewardToken,
    pool,
    nonce,
}: {
    tokenId: bigint;
    rewardToken: Address;
    bonusRewardToken: Address;
    pool: Address;
    nonce: bigint;
}) {
    const { approved } = useFarmCheckApprove(tokenId);

    const [isQueryLoading, setIsQueryLoading] = useState<boolean>(false);

    const address = tokenId && approved ? FARMING_CENTER : undefined;

    const { config } = usePrepareContractWrite({
        address,
        abi: farmingCenterABI,
        functionName: 'enterFarming',
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

    const { data: data, writeAsync: onStake } = useContractWrite(config);

    const { isLoading, isSuccess } = useTransactionAwait(
        data?.hash,
        {
            title: `Stake Position #${tokenId}`,
            tokenId: tokenId.toString(),
            type: TransactionType.FARM
        }
    );

    useEffect(() => {
        if (!isSuccess) return;

        setIsQueryLoading(true);
        const interval: NodeJS.Timeout = setInterval(
            () =>
                farmingClient.refetchQueries({
                    include: ['Deposits'],
                    onQueryUpdated: (query, { result: diff }) => {
                        const currentPos = diff.deposits.find(
                            (deposit: Deposit) =>
                                deposit.id.toString() === tokenId.toString()
                        );
                        if (!currentPos) return;

                        if (currentPos.eternalFarming !== null) {
                            setIsQueryLoading(false);
                            clearInterval(interval);
                        } else {
                            query.refetch().then();
                        }
                    },
                }),
            2000
        );

        return () => clearInterval(interval);
    }, [isSuccess]);

    return {
        isLoading: isQueryLoading || isLoading,
        isSuccess,
        onStake,
    };
}

export function useFarmUnstake({
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
    const [isQueryLoading, setIsQueryLoading] = useState<boolean>(false);

    const exitFarmingCalldata = encodeFunctionData({
        abi: farmingCenterABI,
        functionName: 'exitFarming',
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

    const calldatas = [
        exitFarmingCalldata,
        rewardClaimCalldata,
        bonusRewardClaimCalldata,
    ];

    const { config } = usePrepareContractWrite({
        address: account && tokenId ? FARMING_CENTER : undefined,
        abi: farmingCenterABI,
        functionName: 'multicall',
        args: [calldatas],
    });

    const { data: data, writeAsync: onUnstake } = useContractWrite(config);

    const { isLoading, isSuccess } = useTransactionAwait(
        data?.hash,
        {
            title: `Unstake Position #${tokenId}`,
            tokenId: tokenId.toString(),
            type: TransactionType.FARM
        }
    );

    useEffect(() => {
        if (!isSuccess) return;

        setIsQueryLoading(true);
        const interval: NodeJS.Timeout = setInterval(
            () =>
                farmingClient.refetchQueries({
                    include: ['Deposits'],
                    onQueryUpdated: (query, { result: diff }) => {
                        const currentPos = diff.deposits.find(
                            (deposit: Deposit) =>
                                deposit.id.toString() === tokenId.toString()
                        );
                        if (!currentPos) return;

                        if (currentPos.eternalFarming === null) {
                            setIsQueryLoading(false);
                            clearInterval(interval);
                        } else {
                            query.refetch().then();
                        }
                    },
                }),
            2000
        );

        return () => clearInterval(interval);
    }, [isSuccess]);

    return {
        isLoading: isLoading || isQueryLoading,
        isSuccess,
        onUnstake,
    };
}
