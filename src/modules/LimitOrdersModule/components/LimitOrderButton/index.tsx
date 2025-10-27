import { Button } from "@/components/ui/button";
import { useNeedAllowance } from "@/hooks/common/useNeedAllowance";
import { useApprove } from "@/hooks/common/useApprove";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { IDerivedSwapInfo } from "@/state/swapStore";
import { Token, tryParseTick } from "@cryptoalgebra/custom-pools-sdk";
import { useAccount, useChainId } from "wagmi";
import { LIMIT_ORDER_MANAGER, CUSTOM_POOL_DEPLOYER_ADDRESSES, DEFAULT_CHAIN_NAME } from "config";
import { ApprovalState } from "@/types/approve-state";
import Loader from "@/components/common/Loader";
import { SwapField } from "@/types/swap-field";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Address } from "viem";
import { useWriteLimitOrderManagerPlace } from "@/generated";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { useLimitOrderInfo } from "../../hooks";
import { formatAmount } from "@/utils";

interface LimitOrderButtonProps {
    derivedSwap: IDerivedSwapInfo;
    token0: Token | undefined;
    token1: Token | undefined;
    poolAddress: Address | undefined;
    disabled: boolean;
    sellPrice: string;
    wasInverted: boolean;
    tickSpacing: number | undefined;
    zeroToOne: boolean;
    limitOrderPlugin: boolean;
}

export const LimitOrderButton = ({
    derivedSwap,
    disabled,
    token0,
    token1,
    poolAddress,
    wasInverted,
    sellPrice,
    tickSpacing,
    zeroToOne,
    limitOrderPlugin,
}: LimitOrderButtonProps) => {
    const { address: account } = useAccount();

    const { open } = useAppKit();

    const appChainId = useChainId();

    const { chainId: userChainId } = useAppKitNetwork();

    const {
        currencies: { [SwapField.INPUT]: inputCurrency },
        currencyBalances,
        inputError,
        parsedAmounts: { [SwapField.INPUT]: inputAmount },
    } = derivedSwap;

    const isInverted = wasInverted === zeroToOne;
    const [baseToken, quoteToken] = isInverted ? [token1, token0] : [token0, token1];
    const limitOrderTick = tryParseTick(baseToken, quoteToken, sellPrice, tickSpacing);

    const limitOrder = useLimitOrderInfo(poolAddress, inputAmount, limitOrderTick);

    const chainId = useChainId();

    const needAllowance = useNeedAllowance(
        inputCurrency?.isNative ? undefined : inputCurrency?.wrapped,
        inputAmount,
        LIMIT_ORDER_MANAGER[chainId]
    );

    const insufficientBalance = inputAmount && currencyBalances[SwapField.INPUT]?.lessThan(inputAmount.quotient.toString());

    const isReady =
        token0 &&
        token1 &&
        inputAmount &&
        limitOrder &&
        !disabled &&
        !inputError &&
        !needAllowance &&
        !insufficientBalance &&
        BigInt(limitOrder.liquidity.toString()) > 0;

    const { approvalState, approvalCallback } = useApprove(inputAmount, LIMIT_ORDER_MANAGER[chainId]);

    const placeLimitOrderConfig =
        isReady && CUSTOM_POOL_DEPLOYER_ADDRESSES.LIMIT_ORDERS[chainId]
            ? {
                  address: LIMIT_ORDER_MANAGER[chainId],
                  args: [
                      {
                          token0: token0.address as Address,
                          token1: token1.address as Address,
                          deployer: CUSTOM_POOL_DEPLOYER_ADDRESSES.LIMIT_ORDERS[chainId],
                      },
                      limitOrder.tickLower,
                      zeroToOne,
                      BigInt(limitOrder.liquidity.toString()),
                  ] as const,
                  value: inputAmount?.currency.isNative ? BigInt(inputAmount.quotient.toString()) : BigInt(0),
              }
            : undefined;

    const { data: placeData, writeContract: placeLimitOrder, isPending } = useWriteLimitOrderManagerPlace();

    const { isLoading: isPlaceLoading } = useTransactionAwait(placeData, {
        type: TransactionType.LIMIT_ORDER,
        title: `Buy ${formatAmount(Number(inputAmount?.toSignificant()))} ${inputAmount?.currency.symbol}`,
    });

    const isWrongChain = !userChainId || appChainId !== userChainId;

    if (!account)
        return (
            <Button variant={"primary"} onClick={() => open()}>
                Connect Wallet
            </Button>
        );

    if (isWrongChain)
        return (
            <Button variant={"destructive"} onClick={() => open({ view: "Networks" })}>
                {`Connect to ${DEFAULT_CHAIN_NAME}`}
            </Button>
        );

    if (!limitOrderPlugin)
        return (
            <Button variant={"primary"} disabled>
                This pool doesn't support Limit Orders
            </Button>
        );

    if (!disabled && inputError)
        return (
            <Button variant={"primary"} disabled>
                {inputError}
            </Button>
        );

    if (insufficientBalance) {
        return (
            <Button variant={"primary"} disabled>
                Insufficient {inputAmount.currency.symbol} amount
            </Button>
        );
    }

    if (!disabled && needAllowance)
        return (
            <Button
                variant={"primary"}
                disabled={approvalState === ApprovalState.PENDING}
                onClick={() => approvalCallback && approvalCallback()}
            >
                {approvalState === ApprovalState.PENDING ? <Loader /> : `Approve ${inputAmount?.currency.symbol}`}
            </Button>
        );

    return (
        <Button
            variant={"primary"}
            disabled={disabled || isPlaceLoading || approvalState === ApprovalState.PENDING || isPending || !isReady}
            onClick={() => {
                console.log(
                    "[PLACE LIMIT ORDER]",
                    {
                        token0,
                        token1,
                        inputAmount,
                        limitOrder,
                        disabled,
                        inputError,
                        needAllowance,
                    },
                    isReady && [
                        {
                            token0: token0.address as Address,
                            token1: token1.address as Address,
                        },
                        limitOrder.tickLower,
                        zeroToOne,
                        BigInt(limitOrder.liquidity.toString()),
                    ]
                );
                placeLimitOrderConfig && placeLimitOrder(placeLimitOrderConfig);
            }}
        >
            {isPlaceLoading || isPending ? <Loader /> : "Place an order"}
        </Button>
    );
};
