import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { FARMING_CENTER } from '@/constants/addresses';
import {
    farmingCenterABI,
    useAlgebraPositionManagerApproveForFarming,
    useFarmingCenterEnterFarming,
    useFarmingCenterMulticall,
} from '@/generated';
import { useAccount } from 'wagmi';
import { encodeFunctionData } from 'viem';
import { waitForTransaction } from 'wagmi/actions';
import { Deposit } from '@/graphql/generated/graphql';
import { getRewardsCalldata } from '@/utils/farming/getRewardsCalldata';
import { ViewTxOnExplorer } from '../common/useTransactionAwait';

interface FarmIntegralActionContainerChildrenProps {
    onApprove: () => void;
    onStake: () => void;
    onUnstake?: () => void;
    onHarvest: () => void;
    onHarvestAll: (deposits: Deposit[]) => void;
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

    const { writeAsync: multicall } = useFarmingCenterMulticall();

    const onApprove = useCallback(async () => {
        try {
            console.log(`Approving for ID ${tokenId}`);

            const { hash } = await approveForFarming({
                args: [tokenId, true, FARMING_CENTER],
            });

            toast({
                title: `Approve Position #${tokenId.toString()}`,
                description: `Transaction was sent`,
                action: ViewTxOnExplorer({ hash }),
            });

            await waitForTransaction({ hash, confirmations: 1 });

            toast({
                title: `Approve Position #${tokenId.toString()}`,
                description: `Transaction confirmed!`,
                action: ViewTxOnExplorer({ hash }),
            });
        } catch (error) {
            console.error('Approval failed:', error);
        }
    }, [approveForFarming, tokenId, account]);

    const onStake = useCallback(async () => {
        try {
            console.log(`Staking ID ${tokenId}`);

            const { hash } = await enterFarming({
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

            toast({
                title: `Deposit Position #${tokenId.toString()}`,
                description: `Transaction was sent`,
                action: ViewTxOnExplorer({ hash }),
            });

            await waitForTransaction({ hash, confirmations: 1 });

            toast({
                title: `Deposit Position #${tokenId.toString()}`,
                description: `Transaction confirmed!`,
                action: ViewTxOnExplorer({ hash }),
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

    const onHarvest = useCallback(async () => {
        try {
            if (!account) {
                console.error('Account not found');
                return;
            }

            console.log(`Harvesting ID ${tokenId}`);

            const calldata = getRewardsCalldata({
                rewardToken,
                bonusRewardToken,
                pool,
                nonce,
                tokenId,
                account,
            });

            const { hash } = await multicall({
                args: [calldata],
            });

            toast({
                title: `Harvest Position #${tokenId.toString()}`,
                description: `Transaction was sent`,
                action: ViewTxOnExplorer({ hash }),
            });

            await waitForTransaction({ hash, confirmations: 1 });

            toast({
                title: `Harvest Position #${tokenId.toString()}`,
                description: `Transaction confirmed!`,
                action: ViewTxOnExplorer({ hash }),
            });

            console.log(`Harvest confirmed!`, hash);
        } catch (error) {
            console.error('Harvest failed:', error);
        }
    }, [
        account,
        tokenId,
        rewardToken,
        bonusRewardToken,
        pool,
        nonce,
        multicall,
    ]);

    const onHarvestAll = useCallback(
        async (deposits: Deposit[]) => {
            try {
                if (!account) {
                    console.error('Account not found');
                    return;
                }

                const calldatas: `0x${string}`[] = [];

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

                const { hash } = await multicall({
                    args: [calldatas],
                });

                toast({
                    title: `Harvest All Positions`,
                    description: `Transaction was sent`,
                    action: ViewTxOnExplorer({ hash }),
                });

                await waitForTransaction({ hash, confirmations: 1 });

                toast({
                    title: `Harvest All Positions`,
                    description: `Transaction confirmed!`,
                    action: ViewTxOnExplorer({ hash }),
                });
            } catch (error) {
                console.error('Harvest failed:', error);
            }
        },
        [account, rewardToken, bonusRewardToken, pool, nonce, multicall]
    );

    return { onApprove, onStake, onHarvest, onHarvestAll };
};

export default useFarmIntegralActions;
