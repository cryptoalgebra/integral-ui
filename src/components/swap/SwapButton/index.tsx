import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { DEFAULT_CHAIN_ID, DEFAULT_CHAIN_NAME } from "@/constants/default-chain-id";
import { useApproveCallbackFromTrade } from "@/hooks/common/useApprove";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { useQuotesResults } from "@/hooks/swap/useQuotesResults";
import { useSwapCallback } from "@/hooks/swap/useSwapCallback";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import { useDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { ApprovalState } from "@/types/approve-state";
import { SwapField } from "@/types/swap-field";
import { TradeState } from "@/types/trade-state";
import { computeFiatValuePriceImpact } from "@/utils/swap/computePriceImpact";
import { warningSeverity } from "@/utils/swap/prices";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { useCallback, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";

const SwapButton = () => {

    const { open } = useWeb3Modal()

    const { selectedNetworkId } = useWeb3ModalState()

    const { address: account } = useAccount()

    const { independentField, typedValue } = useSwapState();
    const { tradeState, toggledTrade: trade, allowedSlippage, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo();

    const { wrapType, execute: onWrap, loading: isWrapLoading, inputError: wrapInputError } = useWrapCallback(currencies[SwapField.INPUT], currencies[SwapField.OUTPUT], typedValue);

    const showWrap = wrapType !== WrapType.NOT_APPLICABLE;

    const parsedAmountA =
        independentField === SwapField.INPUT
            ? parsedAmount
            : trade?.inputAmount;

    const parsedAmountB =
        independentField === SwapField.OUTPUT
            ? parsedAmount
            : trade?.outputAmount;

    const parsedAmounts = useMemo(
        () => ({
            [SwapField.INPUT]: independentField === SwapField.INPUT ? parsedAmount : trade?.inputAmount,
            [SwapField.OUTPUT]: independentField === SwapField.OUTPUT ? parsedAmount : trade?.outputAmount,
        }),
        [independentField, parsedAmount, trade]
    );

    const userHasSpecifiedInputOutput = Boolean(currencies[SwapField.INPUT] && currencies[SwapField.OUTPUT] && parsedAmounts[independentField]?.greaterThan('0'));

    const isExpertMode = true
    const routeNotFound = !trade?.route;
    const isLoadingRoute = TradeState.LOADING === tradeState.state;

    const { price: fiatValueInputPrice } = useUSDCValue(parsedAmounts[SwapField.INPUT]);
    const { price: fiatValueOutputPrice } = useUSDCValue(parsedAmounts[SwapField.OUTPUT]);

    const priceImpact = computeFiatValuePriceImpact(fiatValueInputPrice, fiatValueOutputPrice);

    const { approvalState, approvalCallback } = useApproveCallbackFromTrade(trade, allowedSlippage);

    const priceImpactSeverity = useMemo(() => {
        const executionPriceImpact = trade?.priceImpact;
        return warningSeverity(executionPriceImpact && priceImpact ? (executionPriceImpact.greaterThan(priceImpact) ? executionPriceImpact : priceImpact) : executionPriceImpact ?? priceImpact);
    }, [priceImpact, trade]);

    const showApproveFlow =
        !swapInputError &&
        (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING) &&
        !(priceImpactSeverity > 3 && !isExpertMode);

    const { refetch: refetchQuotesA } = useQuotesResults({
        exactInput: true,
        amountIn: parsedAmountA,
        currencyOut: currencies[SwapField.OUTPUT],
    });

    const { refetch: refetchQuotesB } = useQuotesResults({
        exactInput: true,
        amountOut: parsedAmountB,
        currencyIn: currencies[SwapField.INPUT],
    });
    
    const { callback: swapCallback, error: swapCallbackError, isLoading: isSwapLoading, isSuccess: isSwapSuccess } = useSwapCallback(trade, allowedSlippage);

    const handleSwap = useCallback(async () => {
        if (!swapCallback) return;
        await refetchQuotesA();
        await refetchQuotesB();

        swapCallback().catch((error) => new Error(`Swap Failed ${error}`));
    }, [swapCallback, refetchQuotesA, refetchQuotesB]);

    useEffect(() => {
        if (!isSwapSuccess) return;
        refetchQuotesA();
        refetchQuotesB();
    }, [isSwapSuccess]);

    const isValid = !swapInputError;

    const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode;

    const isWrongChain = selectedNetworkId !== DEFAULT_CHAIN_ID

    if (!account) return <Button onClick={() => open()}>Connect Wallet</Button>

    if (isWrongChain) return <Button variant={'destructive'} onClick={() => open({view: 'Networks'})}>{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>

    if (showWrap && wrapInputError) return <Button disabled>{wrapInputError}</Button>

    if (showWrap) return <Button onClick={() => onWrap && onWrap()}>{isWrapLoading ? <Loader/> : wrapType === WrapType.WRAP ? 'Wrap' : 'Unwrap'}</Button>

    if (routeNotFound && userHasSpecifiedInputOutput)
        return (
            <Button disabled>
                {isLoadingRoute ? (
                    <Loader />
                ) : (
                    'Insufficient liquidity for this trade.'
                )}
            </Button>
        );

    if (showApproveFlow)
        return (<Button disabled={approvalState !== ApprovalState.NOT_APPROVED} onClick={() => approvalCallback && approvalCallback()}>
            {approvalState === ApprovalState.PENDING ? <Loader /> : approvalState === ApprovalState.APPROVED ? 'Approved' : `Approve ${currencies[SwapField.INPUT]?.symbol}`}
        </Button>
        );

    return (
        <Button
            onClick={() => handleSwap()}
            disabled={!isValid || priceImpactTooHigh || !!swapCallbackError || isSwapLoading}
        >
            {isSwapLoading ? <Loader /> : swapInputError ? swapInputError : priceImpactTooHigh ? 'Price Impact Too High' : priceImpactSeverity > 2 ? 'Swap Anyway' : 'Swap'}
        </Button>
    );

}

export default SwapButton;