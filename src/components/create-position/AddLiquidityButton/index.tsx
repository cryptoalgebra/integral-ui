import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { NONFUNGIBLE_POSITION_MANAGER, DEFAULT_CHAIN_NAME } from "config";
import { useWriteNonfungiblePositionManagerMulticall } from "@/generated";
import { useApprove } from "@/hooks/common/useApprove";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { IDerivedMintInfo } from "@/state/mintStore";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useUserState } from "@/state/userStore";
import { ApprovalState } from "@/types/approve-state";
import { Percent, Currency, NonfungiblePositionManager, Field, ZERO } from "@cryptoalgebra/custom-pools-sdk";
import { useAppKitNetwork } from "@reown/appkit/react";
import JSBI from "jsbi";
import { useMemo } from "react";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";
import { useWeb3AuthConnect } from "@web3auth/modal/react";

interface AddLiquidityButtonProps {
    baseCurrency: Currency | undefined | null;
    quoteCurrency: Currency | undefined | null;
    mintInfo: IDerivedMintInfo;
    poolAddress: Address | undefined;
}

const ZERO_PERCENT = new Percent("0");
const DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE = new Percent(50, 10_000);

export const AddLiquidityButton = ({ baseCurrency, quoteCurrency, mintInfo, poolAddress }: AddLiquidityButtonProps) => {
    const { address: account } = useAccount();

    const { connect: open } = useWeb3AuthConnect();

    const appChainId = useChainId();

    const { chainId: userChainId } = useAppKitNetwork();

    const { txDeadline } = useUserState();

    const useNative = baseCurrency?.isNative ? baseCurrency : quoteCurrency?.isNative ? quoteCurrency : undefined;

    const { calldata, value } = useMemo(() => {
        if (!account || !mintInfo.position || JSBI.EQ(mintInfo.position.liquidity, ZERO)) return { calldata: undefined, value: undefined };

        return NonfungiblePositionManager.addCallParameters(mintInfo.position, {
            slippageTolerance: mintInfo.outOfRange ? ZERO_PERCENT : DEFAULT_ADD_IN_RANGE_SLIPPAGE_TOLERANCE,
            recipient: account,
            deadline: Date.now() + txDeadline,
            useNative,
            createPool: mintInfo.noLiquidity,
            deployer: mintInfo.pool?.deployer,
        });
    }, [mintInfo, account, txDeadline, useNative]);

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
                  args: calldata && ([calldata as `0x${string}`[]] as const),
                  value: BigInt(value),
              }
            : undefined;

    const { data: addLiquidityData, writeContract: addLiquidity, isPending } = useWriteNonfungiblePositionManagerMulticall();

    const { isLoading: isAddingLiquidityLoading } = useTransactionAwait(
        addLiquidityData,
        {
            title: "Add liquidity",
            tokenA: baseCurrency?.wrapped.address as Address,
            tokenB: quoteCurrency?.wrapped.address as Address,
            type: TransactionType.POOL,
        },
        `/pool/${poolAddress}`
    );

    const isWrongChain = !userChainId || appChainId !== userChainId;

    if (!account) return <Button variant={'primary'} onClick={() => open()}>Connect Wallet</Button>;

    if (isWrongChain)
        return <Button variant={"destructive"} onClick={() => open()}>{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>;

    if (mintInfo.errorMessage) return <Button variant={'primary'} disabled>{mintInfo.errorMessage}</Button>;

    if (showApproveA || showApproveB)
        return (
            <div className="flex w-full gap-2">
                {showApproveA && (
                    <Button
                        variant={'primary'}
                        disabled={approvalStateA === ApprovalState.PENDING}
                        className="w-full"
                        onClick={() => approvalCallbackA && approvalCallbackA()}
                    >
                        {approvalStateA === ApprovalState.PENDING ? <Loader /> : `Approve ${mintInfo.currencies.CURRENCY_A?.symbol}`}
                    </Button>
                )}
                {showApproveB && (
                    <Button
                        variant={'primary'}
                        disabled={approvalStateB === ApprovalState.PENDING}
                        className="w-full"
                        onClick={() => approvalCallbackB && approvalCallbackB()}
                    >
                        {approvalStateB === ApprovalState.PENDING ? <Loader /> : `Approve ${mintInfo.currencies.CURRENCY_B?.symbol}`}
                    </Button>
                )}
            </div>
        );

    return (
        <Button
            variant={'primary'}
            disabled={!isReady || isAddingLiquidityLoading || isPending}
            onClick={() => addLiquidityConfig && addLiquidity(addLiquidityConfig)}
        >
            {isAddingLiquidityLoading || isPending ? <Loader /> : "Create Position"}
        </Button>
    );
};

export default AddLiquidityButton;
