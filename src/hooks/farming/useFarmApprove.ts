import {
    ALGEBRA_POSITION_MANAGER,
    FARMING_CENTER,
} from '@/constants/addresses';
import { algebraPositionManagerABI } from '@/generated';
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useTransitionAwait } from '../common/useTransactionAwait';

export function useFarmApprove(tokenId: bigint) {
    const APPROVE = true;

    const { config } = usePrepareContractWrite({
        address: tokenId ? ALGEBRA_POSITION_MANAGER : undefined,
        abi: algebraPositionManagerABI,
        functionName: 'approveForFarming',
        args: [tokenId, APPROVE, FARMING_CENTER],
    });

    const { data: data, writeAsync: onApprove } = useContractWrite(config);

    const { isLoading, isSuccess } = useTransitionAwait(
        data?.hash,
        `Approve Position #${tokenId}`
    );

    return {
        isLoading,
        isSuccess,
        onApprove,
    };
}
