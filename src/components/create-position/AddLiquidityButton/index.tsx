import { NONFUNGIBLE_POSITION_MANAGER, DEFAULT_CHAIN_NAME } from "config";
import { useWriteNonfungiblePositionManagerMulticall } from "@/generated";
import { useApprove } from "@/hooks/common/useApprove";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { usePosition, usePositions } from "@/hooks/positions/usePositions";
import { IDerivedMintInfo } from "@/state/mintStore";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useUserState } from "@/state/userStore";
import { ApprovalState } from "@/types/approve-state";
import { Percent, Currency, NonfungiblePositionManager, Field, ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import JSBI from "jsbi";
import { useEffect, useMemo } from "react";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";

interface AddLiquidityButtonProps {
    baseCurrency: Currency | undefined | null;
    quoteCurrency: Currency | undefined | null;
    mintInfo: IDerivedMintInfo;
    poolAddress?: Address;
    tokenId?: number;
    handleCloseModal?: () => void;
}

const ZERO_PERCENT = new Percent("0");
const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000);

export const AddLiquidityButton = ({
    baseCurrency,
    quoteCurrency,
    mintInfo,
    poolAddress,
    tokenId,
    handleCloseModal,
}: AddLiquidityButtonProps) => {
    const { address: account } = useAccount();

    const { open } = useAppKit();

    const appChainId = useChainId();

    const { chainId: userChainId } = useAppKitNetwork();

    const { txDeadline } = useUserState();

    const { refetch: refetchAllPositions } = usePositions();

    const { refetch: refetchPosition } = usePosition(tokenId);

    const isIncreaseMode = tokenId !== undefined;

    const useNative = baseCurrency?.isNative ? baseCurrency : quoteCurrency?.isNative ? quoteCurrency : undefined;

    const { calldata, value } = useMemo(() => {
        if (!account || !mintInfo.position || JSBI.EQ(mintInfo.position.liquidity, ZERO)) return { calldata: undefined, value: undefined };

        const increaseOptions = {
            tokenId: tokenId || 0,
            slippageTolerance: mintInfo.outOfRange ? ZERO_PERCENT : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE,
            deadline: Date.now() + txDeadline,
            useNative,
            createPool: mintInfo.noLiquidity,
            deployer: mintInfo.pool?.deployer,
        };

        const mintOptions = {
            recipient: account,
        };

        const options = isIncreaseMode ? increaseOptions : { ...mintOptions, ...increaseOptions };

        return NonfungiblePositionManager.addCallParameters(mintInfo.position, options);
    }, [
        account,
        mintInfo.position,
        mintInfo.outOfRange,
        mintInfo.noLiquidity,
        mintInfo.pool?.deployer,
        tokenId,
        txDeadline,
        useNative,
        isIncreaseMode,
    ]);

    const chainId = useChainId();

    const { approvalState: approvalStateA, approvalCallback: approvalCallbackA } = useApprove(
        mintInfo.parsedAmounts[Field.CURRENCY_A],
        NONFUNGIBLE_POSITION_MANAGER[chainId]
    );
    const { approvalState: approvalStateB, approvalCallback: approvalCallbackB } = useApprove(
        mintInfo.parsedAmounts[Field.CURRENCY_B],
        NONFUNGIBLE_POSITION_MANAGER[chainId]
    );

    const showApproveA = approvalStateA === ApprovalState.NOT_APPROVED || approvalStateA === ApprovalState.PENDING;

    const showApproveB = approvalStateB === ApprovalState.NOT_APPROVED || approvalStateB === ApprovalState.PENDING;

    const isReady = useMemo(() => {
        return Boolean(
            (mintInfo.depositADisabled ? true : approvalStateA === ApprovalState.APPROVED) &&
                (mintInfo.depositBDisabled ? true : approvalStateB === ApprovalState.APPROVED) &&
                !mintInfo.errorMessage &&
                !mintInfo.invalidRange
        );
    }, [mintInfo, approvalStateA, approvalStateB]);

    const addLiquidityConfig =
        calldata && isReady
            ? {
                  address: NONFUNGIBLE_POSITION_MANAGER[appChainId],
                  args: calldata && ([calldata as Address[]] as const),
                  value: BigInt(value),
              }
            : undefined;

    const { data: addLiquidityData, writeContract: addLiquidity, isPending } = useWriteNonfungiblePositionManagerMulticall();

    const { isLoading: isAddingLiquidityLoading, isSuccess } = useTransactionAwait(
        addLiquidityData,
        {
            title: isIncreaseMode ? `Add Liquidity to #${tokenId}` : "Add liquidity",
            tokenA: baseCurrency?.wrapped.address as Address,
            tokenB: quoteCurrency?.wrapped.address as Address,
            type: TransactionType.POOL,
        },
        isIncreaseMode ? undefined : `/pool/${poolAddress}`
    );

    useEffect(() => {
        if (!isSuccess) return;
        if (isIncreaseMode) {
            Promise.all([refetchPosition(), refetchAllPositions()]).then(() => handleCloseModal?.());
        }
    }, [isSuccess, isIncreaseMode, refetchPosition, refetchAllPositions, handleCloseModal]);

    const isWrongChain = !userChainId || appChainId !== userChainId;

    if (!account)
        return (
            <Button variant={"primary"} onClick={() => open()}>
                Connect Wallet
            </Button>
        );

    if (isWrongChain)
        return <Button variant={"destructive"} onClick={() => open({ view: "Networks" })}>{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>;

    if (mintInfo.errorMessage) return <Button disabled>{mintInfo.errorMessage}</Button>;

    if (showApproveA || showApproveB)
        return (
            <div className="flex w-full gap-2">
                {showApproveA && (
                    <Button
                        disabled={approvalStateA === ApprovalState.PENDING}
                        className="w-full"
                        variant="primary"
                        onClick={() => approvalCallbackA && approvalCallbackA()}
                    >
                        {approvalStateA === ApprovalState.PENDING ? <Loader /> : `Approve ${mintInfo.currencies.CURRENCY_A?.symbol}`}
                    </Button>
                )}
                {showApproveB && (
                    <Button
                        disabled={approvalStateB === ApprovalState.PENDING}
                        className="w-full"
                        variant="primary"
                        onClick={() => approvalCallbackB && approvalCallbackB()}
                    >
                        {approvalStateB === ApprovalState.PENDING ? <Loader /> : `Approve ${mintInfo.currencies.CURRENCY_B?.symbol}`}
                    </Button>
                )}
            </div>
        );

    return (
        <Button
            disabled={!isReady || isAddingLiquidityLoading || isPending}
            onClick={() => addLiquidityConfig && addLiquidity(addLiquidityConfig)}
            variant={"primary"}
        >
            {isAddingLiquidityLoading || isPending ? <Loader /> : isIncreaseMode ? "Add Liquidity" : "Create Position"}
        </Button>
    );
};

export default AddLiquidityButton;
