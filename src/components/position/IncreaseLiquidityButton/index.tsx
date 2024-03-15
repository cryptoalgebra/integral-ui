import Loader from '@/components/common/Loader';
import { Button } from '@/components/ui/button';
import { ALGEBRA_POSITION_MANAGER } from '@/constants/addresses';
import {
    DEFAULT_CHAIN_ID,
    DEFAULT_CHAIN_NAME,
} from '@/constants/default-chain-id';
import { useAlgebraPositionManagerIncreaseLiquidity } from '@/generated';
import { useApprove } from '@/hooks/common/useApprove';
import { useTransitionAwait } from '@/hooks/common/useTransactionAwait';
import { IDerivedMintInfo } from '@/state/mintStore';
import { useUserState } from '@/state/userStore';
import { ApprovalState } from '@/types/approve-state';
import { Field } from '@cryptoalgebra/integral-sdk';
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

interface IncreaseLiquidityButtonProps {
    mintInfo: IDerivedMintInfo;
    tokenId?: number;
}

export const IncreaseLiquidityButton = ({
    mintInfo,
    tokenId,
}: IncreaseLiquidityButtonProps) => {
    const { address: account } = useAccount();

    const { open } = useWeb3Modal();

    const { selectedNetworkId } = useWeb3ModalState();

    const { txDeadline } = useUserState();

    const {
        approvalState: approvalStateA,
        approvalCallback: approvalCallbackA,
    } = useApprove(
        mintInfo.parsedAmounts[Field.CURRENCY_A],
        ALGEBRA_POSITION_MANAGER
    );
    const {
        approvalState: approvalStateB,
        approvalCallback: approvalCallbackB,
    } = useApprove(
        mintInfo.parsedAmounts[Field.CURRENCY_B],
        ALGEBRA_POSITION_MANAGER
    );

    const isReady = useMemo(() => {
        return Boolean(
            (mintInfo.depositADisabled
                ? true
                : approvalStateA === ApprovalState.APPROVED) &&
                (mintInfo.depositBDisabled
                    ? true
                    : approvalStateB === ApprovalState.APPROVED) &&
                !mintInfo.errorMessage &&
                !mintInfo.invalidRange
        );
    }, [mintInfo, approvalStateA, approvalStateB]);

    const { data: increaseLiquidityData, write: increaseLiquidity } =
        useAlgebraPositionManagerIncreaseLiquidity({
            args: [
                {
                    tokenId: BigInt(tokenId || 0),
                    amount0Desired: BigInt(
                        mintInfo.parsedAmounts[
                            Field.CURRENCY_A
                        ]?.quotient.toString() ?? 0
                    ),
                    amount1Desired: BigInt(
                        mintInfo.parsedAmounts[
                            Field.CURRENCY_B
                        ]?.quotient.toString() ?? 0
                    ),
                    amount0Min: BigInt(
                        mintInfo.parsedAmounts[
                            Field.CURRENCY_A
                        ]?.quotient.toString() ?? 0
                    ),
                    amount1Min: BigInt(
                        mintInfo.parsedAmounts[
                            Field.CURRENCY_B
                        ]?.quotient.toString() ?? 0
                    ),
                    deadline: BigInt(Date.now() + txDeadline),
                },
            ],
        });

    const { isLoading: isIncreaseLiquidityLoading } = useTransitionAwait(
        increaseLiquidityData?.hash,
        `Add Liquidity to #${tokenId}`
    );

    const isWrongChain = selectedNetworkId !== DEFAULT_CHAIN_ID;

    if (!account) return <Button onClick={() => open()}>Connect Wallet</Button>;

    if (isWrongChain)
        return (
            <Button
                variant={'destructive'}
                onClick={() => open({ view: 'Networks' })}
            >{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>
        );

    if (
        approvalStateA === ApprovalState.NOT_APPROVED ||
        approvalStateA === ApprovalState.PENDING ||
        approvalStateB === ApprovalState.NOT_APPROVED ||
        approvalStateB === ApprovalState.PENDING
    )
        return (
            <div className="flex w-full gap-2">
                {(approvalStateA === ApprovalState.NOT_APPROVED ||
                    approvalStateA === ApprovalState.PENDING) && (
                    <Button
                        disabled={approvalStateA === ApprovalState.PENDING}
                        className="w-full"
                        onClick={() => approvalCallbackA && approvalCallbackA()}
                    >
                        {approvalStateA === ApprovalState.PENDING ? (
                            <Loader />
                        ) : (
                            `Approve ${mintInfo.currencies.CURRENCY_A?.symbol}`
                        )}
                    </Button>
                )}
                {(approvalStateB === ApprovalState.NOT_APPROVED ||
                    approvalStateB === ApprovalState.PENDING) && (
                    <Button
                        disabled={approvalStateB === ApprovalState.PENDING}
                        className="w-full"
                        onClick={() => approvalCallbackB && approvalCallbackB()}
                    >
                        {approvalStateB === ApprovalState.PENDING ? (
                            <Loader />
                        ) : (
                            `Approve ${mintInfo.currencies.CURRENCY_B?.symbol}`
                        )}
                    </Button>
                )}
            </div>
        );

    if (mintInfo.errorMessage)
        return <Button disabled>{mintInfo.errorMessage}</Button>;

    return (
        <Button
            disabled={!isReady || isIncreaseLiquidityLoading}
            onClick={() => increaseLiquidity && increaseLiquidity()}
        >
            {isIncreaseLiquidityLoading ? <Loader /> : 'Add Liquidity'}
        </Button>
    );
};

export default IncreaseLiquidityButton;
