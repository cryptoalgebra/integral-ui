import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { DEFAULT_CHAIN_NAME } from "config";
import { useApproveCallbackFromTrade } from "@/hooks/common/useApprove";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import { IDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { useUserState } from "@/state/userStore";
import { ApprovalState } from "@/types/approve-state";
import { SwapField } from "@/types/swap-field";
import { warningSeverity } from "@/utils/swap/prices";
import { useCallback, useMemo } from "react";
import { useAccount, useChainId } from "wagmi";
import { SmartRouter } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { tryParseAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";

import SmartRouterModule from "@/modules/SmartRouterModule";
import { useSwapCallback } from "@/hooks/swap/useSwapCallback";
import { TradeState } from "@/types/trade-state";
const { useSmartRouterCallback } = SmartRouterModule.hooks;

const SwapButton = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const { open } = useAppKit();

    const appChainId = useChainId();

    const { chainId: userChainId } = useAppKitNetwork();

    const { address: account } = useAccount();

    const { isExpertMode } = useUserState();

    const { independentField, typedValue } = useSwapState();
    const {
        allowedSlippage,
        parsedAmount,
        currencies,
        inputError: swapInputError,
        currencyBalances,
        toggledTrade: trade,
        tradeState,
        smartTradeCallOptions,
    } = derivedSwap;

    const {
        wrapType,
        execute: onWrap,
        loading: isWrapLoading,
        inputError: wrapInputError,
    } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    const showWrap = wrapType !== WrapType.NOT_APPLICABLE;

    const parsedAmountA =
        independentField === SwapField.INPUT
            ? parsedAmount
            : tryParseAmount(trade?.inputAmount?.toSignificant(), trade?.inputAmount?.currency);

    const parsedAmountB =
        independentField === SwapField.OUTPUT
            ? parsedAmount
            : tryParseAmount(trade?.outputAmount?.toSignificant(), trade?.outputAmount?.currency);

    const parsedAmounts = useMemo(
        () => ({
            [SwapField.INPUT]: parsedAmountA,
            [SwapField.OUTPUT]: parsedAmountB,
        }),
        [parsedAmountA, parsedAmountB]
    );

    const userHasSpecifiedInputOutput = Boolean(
        currencies[SwapField.INPUT] &&
            currencies[SwapField.OUTPUT] &&
            independentField !== SwapField.LIMIT_ORDER_PRICE &&
            parsedAmounts[independentField]?.greaterThan("0")
    );

    const isLoadingRoute = tradeState.state === TradeState.LOADING;
    const routeNotFound = !trade;
    const insufficientBalance =
        currencyBalances[SwapField.INPUT] &&
        trade?.inputAmount &&
        currencyBalances[SwapField.INPUT]?.lessThan(trade.inputAmount.quotient.toString());

    const { approvalState, approvalCallback } = useApproveCallbackFromTrade(trade, allowedSlippage);

    const isSmartTrade = trade && "routes" in trade;

    const priceImpact = useMemo(() => {
        if (!trade) return undefined;

        if (isSmartTrade) {
            return SmartRouter.getPriceImpact(trade);
        } else {
            return trade.priceImpact;
        }
    }, [trade, isSmartTrade]);

    const priceImpactSeverity = useMemo(() => {
        if (!priceImpact) return 0;
        return warningSeverity(priceImpact);
    }, [priceImpact]);

    const { callback: smartSwapCallback, isLoading: smartSwapLoading } = useSmartRouterCallback(
        trade?.inputAmount?.currency,
        trade?.outputAmount?.currency,
        trade?.inputAmount?.toFixed(),
        smartTradeCallOptions.calldata,
        smartTradeCallOptions.value
    );

    const {
        callback: swapCallback,
        isLoading: swapLoading,
        error: swapError,
    } = useSwapCallback(!isSmartTrade ? trade : null, allowedSlippage, approvalState);

    const isSwapLoading = swapLoading || smartSwapLoading;

    const handleSwap = useCallback(async () => {
        if (!swapCallback && !smartSwapCallback) return;
        try {
            if (isSmartTrade) {
                await smartSwapCallback?.();
            } else {
                await swapCallback?.();
            }
        } catch (error) {
            return new Error(`Swap Failed ${error}`);
        }
    }, [swapCallback, smartSwapCallback, isSmartTrade]);

    const isValid = !swapInputError && !swapError;

    const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode;

    const showApproveFlow =
        !swapInputError && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING) && !priceImpactTooHigh;

    const isWrongChain = !userChainId || appChainId !== userChainId;

    if (!account) return <Button onClick={() => open()}>Connect Wallet</Button>;

    if (isWrongChain)
        return <Button variant={"destructive"} onClick={() => open({ view: "Networks" })}>{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>;

    if (showWrap && wrapInputError) return <Button disabled>{wrapInputError}</Button>;

    if (showWrap)
        return (
            <Button onClick={() => onWrap && onWrap()}>
                {isWrapLoading ? <Loader /> : wrapType === WrapType.WRAP ? "Wrap" : "Unwrap"}
            </Button>
        );

    if (routeNotFound && userHasSpecifiedInputOutput)
        return <Button disabled>{isLoadingRoute ? <Loader /> : "Insufficient liquidity for this trade."}</Button>;

    if (trade && insufficientBalance) {
        return <Button disabled>{isLoadingRoute ? <Loader /> : `Insufficient ${trade.inputAmount.currency.symbol} amount`}</Button>;
    }

    if (showApproveFlow)
        return (
            <Button disabled={approvalState !== ApprovalState.NOT_APPROVED} onClick={() => approvalCallback && approvalCallback()}>
                {approvalState === ApprovalState.PENDING ? (
                    <Loader />
                ) : approvalState === ApprovalState.APPROVED ? (
                    "Approved"
                ) : (
                    `Approve ${currencies[SwapField.INPUT]?.symbol}`
                )}
            </Button>
        );

    return (
        <>
            <Button onClick={() => handleSwap()} disabled={!isValid || priceImpactTooHigh || isSwapLoading || isLoadingRoute}>
                {isSwapLoading ? (
                    <Loader />
                ) : priceImpactTooHigh ? (
                    "Price Impact Too High"
                ) : priceImpactSeverity > 2 ? (
                    "Swap Anyway"
                ) : swapInputError || swapError ? (
                    swapInputError || swapError
                ) : (
                    "Swap"
                )}
            </Button>
        </>
    );
};

export default SwapButton;
