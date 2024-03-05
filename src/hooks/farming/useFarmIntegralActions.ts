interface FarmIntegralActionContainerChildrenProps {
    onApprove: () => void;
    onStake: () => void;
    onUnstake: () => void;
    onHarvest: () => void;
    onHarvestAll: (calldatas: string[]) => void;
}

const useFarmIntegralActions = ({
    tokenId,
    rewardToken,
    bonusRewardToken,
    pool,
    nonce,
}: {
    tokenId: string;
    rewardToken: string;
    bonusRewardToken: string;
    pool: string;
    nonce: string;
}): FarmIntegralActionContainerChildrenProps => {
    const { t } = useTranslation();
    const { toastSuccess } = useToast();
    const { address: account } = useAccount();
    const signer = useEthersSigner();

    const gasPrice = useGasPrice();
    const { loading, fetchWithCatchTxError } = useCatchTxError();

    const algebraFarmingCenter = useAlgebraFarmingCenterContract();
    const algebraPositionManager = useAlgebraPositionManagerContract();

    const onApprove = useCallback(async () => {
        const calldata = algebraPositionManager.interface.encodeFunctionData(
            'approveForFarming',
            [tokenId, true, algebraFarmingCenter.address]
        );

        const txn = {
            to: algebraPositionManager.address,
            data: calldata,
        };

        const resp = await fetchWithCatchTxError(() =>
            signer.estimateGas(txn).then((estimate) => {
                const newTxn = {
                    ...txn,
                    gasPrice,
                    gasLimit: calculateGasMargin(estimate),
                };

                return signer.sendTransaction(newTxn);
            })
        );
        if (resp?.status) {
            toastSuccess(
                `${t('Approved')}!`,
                <ToastDescriptionWithTx txHash={resp.transactionHash}>
                    {t('Position was approved for farming')}
                </ToastDescriptionWithTx>
            );
        }
    }, [
        account,
        fetchWithCatchTxError,
        signer,
        t,
        algebraPositionManager,
        algebraFarmingCenter,
        toastSuccess,
        tokenId,
    ]);

    const onUnstake = useCallback(async () => {
        const callDatas = [
            algebraFarmingCenter.interface.encodeFunctionData('exitFarming', [
                { rewardToken, bonusRewardToken, pool, nonce },
                tokenId,
            ]),
            algebraFarmingCenter.interface.encodeFunctionData('claimReward', [
                rewardToken,
                account,
                MaxUint128,
            ]),
            algebraFarmingCenter.interface.encodeFunctionData('claimReward', [
                bonusRewardToken,
                account,
                MaxUint128,
            ]),
        ];

        const calldata = algebraFarmingCenter.interface.encodeFunctionData(
            'multicall',
            [callDatas]
        );

        const txn = {
            to: algebraFarmingCenter.address,
            data: calldata,
        };

        const resp = await fetchWithCatchTxError(() =>
            signer.estimateGas(txn).then((estimate) => {
                const newTxn = {
                    ...txn,
                    gasPrice,
                    gasLimit: calculateGasMargin(estimate),
                };

                return signer.sendTransaction(newTxn);
            })
        );
        if (resp?.status) {
            toastSuccess(
                `${t('Unstaked')}!`,
                <ToastDescriptionWithTx txHash={resp.transactionHash}>
                    {t('Your earnings have also been harvested to your wallet')}
                </ToastDescriptionWithTx>
            );
        }
    }, [
        account,
        fetchWithCatchTxError,
        algebraFarmingCenter,
        signer,
        t,
        toastSuccess,
        rewardToken,
        tokenId,
    ]);

    const onStake = useCallback(async () => {
        const calldata = algebraFarmingCenter.interface.encodeFunctionData(
            'enterFarming',
            [
                {
                    rewardToken,
                    bonusRewardToken,
                    pool,
                    nonce,
                },
                tokenId,
            ]
        );

        const txn = {
            to: algebraFarmingCenter.address,
            data: calldata,
        };

        const resp = await fetchWithCatchTxError(() =>
            signer.estimateGas(txn).then((estimate) => {
                const newTxn = {
                    ...txn,
                    gasPrice,
                    gasLimit: calculateGasMargin(estimate),
                };

                return signer.sendTransaction(newTxn);
            })
        );

        if (resp?.status) {
            toastSuccess(
                `${t('Staked')}!`,
                <ToastDescriptionWithTx txHash={resp.transactionHash}>
                    {t('Your funds have been staked in the farm')}
                </ToastDescriptionWithTx>
            );
        }
    }, [
        account,
        fetchWithCatchTxError,
        algebraFarmingCenter,
        signer,
        t,
        toastSuccess,
        rewardToken,
        tokenId,
    ]);

    const onHarvest = useCallback(async () => {
        const collectRewards =
            algebraFarmingCenter.interface.encodeFunctionData(
                'collectRewards',
                [{ rewardToken, bonusRewardToken, pool, nonce }, tokenId]
            );
        const claimReward1 = algebraFarmingCenter.interface.encodeFunctionData(
            'claimReward',
            [rewardToken, account, MaxUint128]
        );
        const claimReward2 = algebraFarmingCenter.interface.encodeFunctionData(
            'claimReward',
            [bonusRewardToken, account, MaxUint128]
        );

        let calldata;

        if (rewardToken.toLowerCase() !== bonusRewardToken.toLowerCase()) {
            calldata = [collectRewards, claimReward1, claimReward2];
        } else {
            calldata = [collectRewards, claimReward1];
        }

        const mcall = algebraFarmingCenter.interface.encodeFunctionData(
            'multicall',
            [calldata]
        );

        const txn = {
            to: algebraFarmingCenter.address,
            data: mcall,
        };

        const resp = await fetchWithCatchTxError(() =>
            signer.estimateGas(txn).then((estimate) => {
                const newTxn = {
                    ...txn,
                    gasPrice,
                    gasLimit: calculateGasMargin(estimate),
                };

                return signer.sendTransaction(newTxn);
            })
        );

        if (resp?.status) {
            toastSuccess(
                `${t('Harvested')}!`,
                <ToastDescriptionWithTx txHash={resp.transactionHash}>
                    {t('Earnings have been sent to your wallet!')}
                </ToastDescriptionWithTx>
            );
            // mutate((key) => Array.isArray(key) && key[0] === 'mcv3-harvest', undefined)
        }
    }, [
        account,
        fetchWithCatchTxError,
        algebraFarmingCenter,
        signer,
        t,
        toastSuccess,
        rewardToken,
        tokenId,
    ]);

    const onHarvestAll = useCallback(
        async (calldatas: string[]) => {
            const calldata = algebraFarmingCenter.interface.encodeFunctionData(
                'multicall',
                [calldatas]
            );

            const txn = {
                to: algebraFarmingCenter.address,
                data: calldata,
            };

            const resp = await fetchWithCatchTxError(() =>
                signer.estimateGas(txn).then((estimate) => {
                    const newTxn = {
                        ...txn,
                        gasPrice,
                        gasLimit: calculateGasMargin(estimate),
                    };

                    return signer.sendTransaction(newTxn);
                })
            );

            if (resp?.status) {
                toastSuccess(
                    `${t('Harvested')}!`,
                    <ToastDescriptionWithTx txHash={resp.transactionHash}>
                        {t('Earnings have been sent to your wallet!')}
                    </ToastDescriptionWithTx>
                );
                // mutate((key) => Array.isArray(key) && key[0] === 'mcv3-harvest', undefined)
            }
        },
        [
            account,
            fetchWithCatchTxError,
            algebraFarmingCenter,
            signer,
            t,
            toastSuccess,
            rewardToken,
            tokenId,
        ]
    );

    return {
        attemptingTxn: loading,
        onApprove,
        onStake,
        onUnstake,
        onHarvest,
        onHarvestAll,
    };
};

export function useFarmIntegralApprove(tokenId: string) {
    const [approve, setApprove] = useState<boolean>();

    const algebraPositionManager = useAlgebraPositionManagerContract();

    useEffect(() => {
        algebraPositionManager.callStatic
            .farmingApprovals(tokenId)
            .then((approval) => setApprove(approval !== ADDRESS_ZERO));
    });

    return {
        approve,
        isLoading: approve === undefined,
    };
}

export default useFarmIntegralActions;
