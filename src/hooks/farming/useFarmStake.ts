import { FARMING_CENTER } from '@/constants/addresses';
import { farmingCenterABI } from '@/generated';
import { Address, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useTransitionAwait } from '../common/useTransactionAwait';

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
    const { config } = usePrepareContractWrite({
        address: tokenId ? FARMING_CENTER : undefined,
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

    const { isLoading, isSuccess } = useTransitionAwait(
        data?.hash,
        `Stake Position #${tokenId}`
    );

    return {
        isLoading,
        isSuccess,
        onStake,
    };
}

// export function useFarmUnstake(
//     tokenId: bigint,
//     rewardToken: Address,
//     bonusRewardToken: Address,
//     pool: Address,
//     nonce: bigint
// ) {
//     const { config } = usePrepareContractWrite({
//         address: FARMING_CENTER,
//         abi: farmingCenterABI,
//         functionName: 'enterFarming',
//         args: [
//             {
//                 rewardToken,
//                 bonusRewardToken,
//                 pool,
//                 nonce,
//             },
//             tokenId,
//         ],
//     });

//     const { data: data, writeAsync: onStake } = useContractWrite(config);

//     const { isLoading, isSuccess } = useTransitionAwait(
//         data?.hash,
//         `Stake Position #${tokenId}`
//     );

//     return {
//         isLoading,
//         isSuccess,
//         onStake,
//     };
// }
