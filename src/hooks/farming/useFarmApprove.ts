import {
    ALGEBRA_POSITION_MANAGER,
    FARMING_CENTER,
} from '@/constants/addresses';
import { algebraPositionManagerABI } from '@/generated';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useTransactionAwait } from '../common/useTransactionAwait';
import { useEffect } from 'react';
import { useFarmCheckApprove } from './useFarmCheckApprove';
import { TransactionType } from '@/state/pendingTransactionsStore';

export function useFarmApprove(tokenId: bigint) {
    const APPROVE = true;

    const { config } = usePrepareContractWrite({
        address: tokenId ? ALGEBRA_POSITION_MANAGER : undefined,
        abi: algebraPositionManagerABI,
        functionName: 'approveForFarming',
        args: [tokenId, APPROVE, FARMING_CENTER],
    });

    const { data: data, writeAsync: onApprove, isLoading: isPending } = useContractWrite(config);

    const { isLoading, isSuccess } = useTransactionAwait(
        data?.hash,
        {
            title: `Approve Position #${tokenId}`,
            tokenId: tokenId.toString(),
            type: TransactionType.FARM
        }
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
        isPending
    };
}
