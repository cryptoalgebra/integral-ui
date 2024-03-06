import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { FARMING_CENTER } from '@/constants/addresses';
import {
    useAlgebraPositionManagerApproveForFarming,
    useFarmingCenterEnterFarming,
} from '@/generated';
import { useAccount } from 'wagmi';

interface FarmIntegralActionContainerChildrenProps {
    onApprove: () => void;
    onStake: () => void;
    onUnstake?: () => void;
    onHarvest?: () => void;
    onHarvestAll?: (calldatas: string[]) => void;
}

const useFarmIntegralActions = ({
    tokenId,
    rewardToken,
    bonusRewardToken,
    pool,
    nonce,
}: {
    tokenId: bigint;
    rewardToken: `0x${string}`;
    bonusRewardToken: `0x${string}`;
    pool: `0x${string}`;
    nonce: bigint;
}): FarmIntegralActionContainerChildrenProps => {
    const { address: account } = useAccount();

    const { writeAsync: approveForFarming } =
        useAlgebraPositionManagerApproveForFarming();

    const { writeAsync: enterFarming } = useFarmingCenterEnterFarming();

    const onApprove = useCallback(async () => {
        try {
            console.log(`Approving for ID ${tokenId}`);

            const { hash } = await approveForFarming({
                args: [tokenId, true, FARMING_CENTER],
            });

            toast({
                title: 'Approved!',
                description: `Position #${tokenId} was approved for farming!`,
            });
        } catch (error) {
            console.error('Approval failed:', error);
        }
    }, [approveForFarming, tokenId, account]);

    const onStake = useCallback(async () => {
        try {
            console.log(`Staking ID ${tokenId}`);
            const data = await enterFarming({
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
            console.log(data);
            toast({
                title: 'Staked!',
                description: `Position #${tokenId} was staked for farming!`,
            });
        } catch (error) {
            console.error('Approval failed:', error);
        }
    }, [
        account,
        rewardToken,
        tokenId,
        bonusRewardToken,
        pool,
        nonce,
        enterFarming,
    ]);

    return { onApprove, onStake };

    // const onApprove = useCallback(async () => {
    //     // const resp = await fetchWithCatchTxError(() =>
    //     //     signer.estimateGas(txn).then((estimate) => {
    //     //         const newTxn = {
    //     //             ...txn,
    //     //             gasPrice,
    //     //             gasLimit: calculateGasMargin(estimate),
    //     //         };
    //     //         return signer.sendTransaction(newTxn);
    //     //     })
    //     // );
    //     // if (resp?.status) {
    //     //     toastSuccess(
    //     //         `${t('Approved')}!`,
    //     //         <ToastDescriptionWithTx txHash={resp.transactionHash}>
    //     //             {t('Position was approved for farming')}
    //     //         </ToastDescriptionWithTx>
    //     //     );
    //     // }
    // }, [
    //     account,
    //     fetchWithCatchTxError,
    //     signer,
    //     t,
    //     algebraPositionManager,
    //     algebraFarmingCenter,
    //     toastSuccess,
    //     tokenId,
    // ]);

    //     const onUnstake = useCallback(async () => {
    //         const callDatas = [
    //             algebraFarmingCenter.interface.encodeFunctionData('exitFarming', [
    //                 { rewardToken, bonusRewardToken, pool, nonce },
    //                 tokenId,
    //             ]),
    //             algebraFarmingCenter.interface.encodeFunctionData('claimReward', [
    //                 rewardToken,
    //                 account,
    //                 MaxUint128,
    //             ]),
    //             algebraFarmingCenter.interface.encodeFunctionData('claimReward', [
    //                 bonusRewardToken,
    //                 account,
    //                 MaxUint128,
    //             ]),
    //         ];

    //         const calldata = algebraFarmingCenter.interface.encodeFunctionData(
    //             'multicall',
    //             [callDatas]
    //         );

    //         const txn = {
    //             to: algebraFarmingCenter.address,
    //             data: calldata,
    //         };

    //         const resp = await fetchWithCatchTxError(() =>
    //             signer.estimateGas(txn).then((estimate) => {
    //                 const newTxn = {
    //                     ...txn,
    //                     gasPrice,
    //                     gasLimit: calculateGasMargin(estimate),
    //                 };

    //                 return signer.sendTransaction(newTxn);
    //             })
    //         );
    //         if (resp?.status) {
    //             toastSuccess(
    //                 `${t('Unstaked')}!`,
    //                 <ToastDescriptionWithTx txHash={resp.transactionHash}>
    //                     {t('Your earnings have also been harvested to your wallet')}
    //                 </ToastDescriptionWithTx>
    //             );
    //         }
    //     }, [
    //         account,
    //         fetchWithCatchTxError,
    //         algebraFarmingCenter,
    //         signer,
    //         t,
    //         toastSuccess,
    //         rewardToken,
    //         tokenId,
    //     ]);

    //     const onHarvest = useCallback(async () => {
    //         const collectRewards =
    //             algebraFarmingCenter.interface.encodeFunctionData(
    //                 'collectRewards',
    //                 [{ rewardToken, bonusRewardToken, pool, nonce }, tokenId]
    //             );
    //         const claimReward1 = algebraFarmingCenter.interface.encodeFunctionData(
    //             'claimReward',
    //             [rewardToken, account, MaxUint128]
    //         );
    //         const claimReward2 = algebraFarmingCenter.interface.encodeFunctionData(
    //             'claimReward',
    //             [bonusRewardToken, account, MaxUint128]
    //         );

    //         let calldata;

    //         if (rewardToken.toLowerCase() !== bonusRewardToken.toLowerCase()) {
    //             calldata = [collectRewards, claimReward1, claimReward2];
    //         } else {
    //             calldata = [collectRewards, claimReward1];
    //         }

    //         const mcall = algebraFarmingCenter.interface.encodeFunctionData(
    //             'multicall',
    //             [calldata]
    //         );

    //         const txn = {
    //             to: algebraFarmingCenter.address,
    //             data: mcall,
    //         };

    //         const resp = await fetchWithCatchTxError(() =>
    //             signer.estimateGas(txn).then((estimate) => {
    //                 const newTxn = {
    //                     ...txn,
    //                     gasPrice,
    //                     gasLimit: calculateGasMargin(estimate),
    //                 };

    //                 return signer.sendTransaction(newTxn);
    //             })
    //         );

    //         if (resp?.status) {
    //             toastSuccess(
    //                 `${t('Harvested')}!`,
    //                 <ToastDescriptionWithTx txHash={resp.transactionHash}>
    //                     {t('Earnings have been sent to your wallet!')}
    //                 </ToastDescriptionWithTx>
    //             );
    //             // mutate((key) => Array.isArray(key) && key[0] === 'mcv3-harvest', undefined)
    //         }
    //     }, [
    //         account,
    //         fetchWithCatchTxError,
    //         algebraFarmingCenter,
    //         signer,
    //         t,
    //         toastSuccess,
    //         rewardToken,
    //         tokenId,
    //     ]);

    //     const onHarvestAll = useCallback(
    //         async (calldatas: string[]) => {
    //             const calldata = algebraFarmingCenter.interface.encodeFunctionData(
    //                 'multicall',
    //                 [calldatas]
    //             );

    //             const txn = {
    //                 to: algebraFarmingCenter.address,
    //                 data: calldata,
    //             };

    //             const resp = await fetchWithCatchTxError(() =>
    //                 signer.estimateGas(txn).then((estimate) => {
    //                     const newTxn = {
    //                         ...txn,
    //                         gasPrice,
    //                         gasLimit: calculateGasMargin(estimate),
    //                     };

    //                     return signer.sendTransaction(newTxn);
    //                 })
    //             );

    //             if (resp?.status) {
    //                 toastSuccess(
    //                     `${t('Harvested')}!`,
    //                     <ToastDescriptionWithTx txHash={resp.transactionHash}>
    //                         {t('Earnings have been sent to your wallet!')}
    //                     </ToastDescriptionWithTx>
    //                 );
    //                 // mutate((key) => Array.isArray(key) && key[0] === 'mcv3-harvest', undefined)
    //             }
    //         },
    //         [
    //             account,
    //             fetchWithCatchTxError,
    //             algebraFarmingCenter,
    //             signer,
    //             t,
    //             toastSuccess,
    //             rewardToken,
    //             tokenId,
    //         ]
    //     );

    //     return {
    //         attemptingTxn: loading,
    //         onApprove,
    //         onStake,
    //         onUnstake,
    //         onHarvest,
    //         onHarvestAll,
    //     };
    // };

    // export function useFarmIntegralApprove(tokenId: string) {
    //     const [approve, setApprove] = useState<boolean>();

    //     const algebraPositionManager = useAlgebraPositionManagerContract();

    //     useEffect(() => {
    //         algebraPositionManager.callStatic
    //             .farmingApprovals(tokenId)
    //             .then((approval) => setApprove(approval !== ADDRESS_ZERO));
    //     });

    //     return {
    //         approve,
    //         isLoading: approve === undefined,
    //     };
};

export default useFarmIntegralActions;
