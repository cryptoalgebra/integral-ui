import Loader from '@/components/common/Loader';
import { Button } from '@/components/ui/button';
import { ALGEBRA_POSITION_MANAGER } from '@/constants/addresses';
import {
    DEFAULT_CHAIN_ID,
    DEFAULT_CHAIN_NAME,
} from '@/constants/default-chain-id';
import { usePrepareAlgebraPositionManagerMulticall } from '@/generated';
import { useApprove } from '@/hooks/common/useApprove';
import { useTransactionAwait } from '@/hooks/common/useTransactionAwait';
import { usePosition, usePositions } from '@/hooks/positions/usePositions';
import { IDerivedMintInfo } from '@/state/mintStore';
import { TransactionType } from '@/state/pendingTransactionsStore';
import { useUserState } from '@/state/userStore';
import { ApprovalState } from '@/types/approve-state';
import {
  ADDRESS_ZERO,
  Currency,
  Field,
  NonfungiblePositionManager,
  Percent,
  ZERO,
} from '@cryptoalgebra/sdk';
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import JSBI from 'jsbi';
import { useEffect, useMemo } from 'react';
import { Address, useAccount, useContractWrite } from 'wagmi';

interface IncreaseLiquidityButtonProps {
    baseCurrency: Currency | undefined | null;
    quoteCurrency: Currency | undefined | null;
    mintInfo: IDerivedMintInfo;
    tokenId?: number;
    handleCloseModal?: () => void;
}

const ZERO_PERCENT = new Percent('0');
const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000);

export const IncreaseLiquidityButton = ({
    mintInfo,
    tokenId,
    baseCurrency,
    quoteCurrency,
    handleCloseModal,
}: IncreaseLiquidityButtonProps) => {
    const { address: account } = useAccount();

    const { open } = useWeb3Modal();

    const { selectedNetworkId } = useWeb3ModalState();

    const { txDeadline } = useUserState();

    const { refetch: refetchAllPositions } = usePositions();

    const { refetch: refetchPosition } = usePosition(tokenId);

    const useNative = baseCurrency?.isNative
        ? baseCurrency
        : quoteCurrency?.isNative
        ? quoteCurrency
        : undefined;

    const { calldata, value } = useMemo(() => {
        if (
            !account ||
            !mintInfo.position ||
            JSBI.EQ(mintInfo.position.liquidity, ZERO)
        )
            return { calldata: undefined, value: undefined };

        return NonfungiblePositionManager.addCallParameters(mintInfo.position, {
            tokenId: tokenId || 0,
            slippageTolerance: mintInfo.outOfRange
                ? ZERO_PERCENT
                : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE,
            deadline: Date.now() + txDeadline,
            deployer: ADDRESS_ZERO,
            useNative,
        });
    }, [mintInfo, account, tokenId, txDeadline, useNative]);

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

    const showApproveA =
        approvalStateA === ApprovalState.NOT_APPROVED ||
        approvalStateA === ApprovalState.PENDING;

    const showApproveB =
        approvalStateB === ApprovalState.NOT_APPROVED ||
        approvalStateB === ApprovalState.PENDING;

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

    const { config: increaseLiquidityConfig } =
        usePrepareAlgebraPositionManagerMulticall({
            args: calldata && [calldata as `0x${string}`[]],
            enabled: Boolean(calldata && isReady && tokenId),
            value: BigInt(value || 0),
        });

    const { data: increaseLiquidityData, write: increaseLiquidity } =
        useContractWrite(increaseLiquidityConfig);

    const { isLoading: isIncreaseLiquidityLoading, isSuccess } =
        useTransactionAwait(
            increaseLiquidityData?.hash,
            {
                title: `Add Liquidity to #${tokenId}`,
                tokenA: baseCurrency?.wrapped.address as Address,
                tokenB: quoteCurrency?.wrapped.address as Address,
                type: TransactionType.POOL
            }
        );

    useEffect(() => {
        if (!isSuccess) return;
        Promise.all([refetchPosition(), refetchAllPositions()])
            .then(() => handleCloseModal?.());
    }, [isSuccess]);

    const isWrongChain = selectedNetworkId !== DEFAULT_CHAIN_ID;

    if (!account) return <Button onClick={() => open()}>Connect Wallet</Button>;

    if (isWrongChain)
        return (
            <Button
                variant={'destructive'}
                onClick={() => open({ view: 'Networks' })}
            >{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>
        );

    if (mintInfo.errorMessage)
        return <Button disabled>{mintInfo.errorMessage}</Button>;

    if (showApproveA || showApproveB)
        return (
            <div className="flex w-full gap-2">
                {showApproveA && (
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
                {showApproveB && (
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
