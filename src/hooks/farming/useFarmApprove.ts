import {
    ALGEBRA_POSITION_MANAGER,
    FARMING_CENTER,
} from '@/constants/addresses';
import { algebraPositionManagerABI } from '@/generated';
import { Address, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useTransitionAwait } from '../common/useTransactionAwait';
import { useEffect } from 'react';
import { useFarmCheckApprove } from './useFarmCheckApprove';
import { isSameRewards } from '@/utils/farming/isSameRewards';

export function useFarmApprove(tokenId: bigint, rewardToken: Address, bonusRewardToken: Address) {
    const APPROVE = true;

    const { config } = usePrepareContractWrite({
        address: tokenId ? ALGEBRA_POSITION_MANAGER : undefined,
        abi: algebraPositionManagerABI,
        functionName: 'approveForFarming',
        args: [tokenId, APPROVE, FARMING_CENTER],
    });

    const { data: data, writeAsync: onApprove } = useContractWrite(config);

    const isSameReward = isSameRewards(rewardToken, bonusRewardToken)

    const { isLoading, isSuccess } = useTransitionAwait(
        data?.hash,
        `Approve Position #${tokenId}`,
        '',
        '',
        rewardToken,
        !isSameReward ? bonusRewardToken : undefined,
    );

    const { handleCheckApprove } = useFarmCheckApprove(tokenId);

    useEffect(() => {
        if (isSuccess) {
            handleCheckApprove();
        }
    }, [isSuccess]);

    return {
        isLoading,
        isSuccess,
        onApprove,
    };
}
