import Loader from '@/components/common/Loader';
import { Button } from '@/components/ui/button';
import {
    DEFAULT_CHAIN_ID,
    DEFAULT_CHAIN_NAME,
} from '@/constants/default-chain-id';
import { useApproveCallbackFromTrade } from '@/hooks/common/useApprove';
import { useQuotesResults } from '@/hooks/swap/useQuotesResults';
import { useSwapCallback } from '@/hooks/swap/useSwapCallback';
import useWrapCallback, { WrapType } from '@/hooks/swap/useWrapCallback';
import { useDerivedSwapInfo, useSwapState } from '@/state/swapStore';
import { useUserState } from '@/state/userStore';
import { ApprovalState } from '@/types/approve-state';
import { SwapField } from '@/types/swap-field';
import { QuoteResult } from '@/types/swap-quote';
import { TradeState } from '@/types/trade-state';
import {
    computeRealizedLPFeePercent,
    warningSeverity,
} from '@/utils/swap/prices';
import { Currency, CurrencyAmount } from '@cryptoalgebra/integral-sdk';
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';

const SwapButton = () => {
    const { open } = useWeb3Modal();

    const [isRatesChanged, setIsRatesChanged] = useState<boolean>(false);

    const { selectedNetworkId } = useWeb3ModalState();

    const { address: account } = useAccount();

    const { isExpertMode } = useUserState();

    const { independentField, typedValue } = useSwapState();
    const {
        tradeState,
        toggledTrade: trade,
        allowedSlippage,
        parsedAmount,
        currencies,
        inputError: swapInputError,
    } = useDerivedSwapInfo();

    const {
        wrapType,
        execute: onWrap,
        loading: isWrapLoading,
        inputError: wrapInputError,
    } = useWrapCallback(
        currencies[SwapField.INPUT],
        currencies[SwapField.OUTPUT],
        typedValue
    );

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
            [SwapField.INPUT]: parsedAmountA,
            [SwapField.OUTPUT]: parsedAmountB,
        }),
        [parsedAmountA, parsedAmountB]
    );

    const userHasSpecifiedInputOutput = Boolean(
        currencies[SwapField.INPUT] &&
            currencies[SwapField.OUTPUT] &&
            parsedAmounts[independentField]?.greaterThan('0')
    );

    const routeNotFound = !trade?.route;
    const isLoadingRoute = TradeState.LOADING === tradeState.state;

    const { approvalState, approvalCallback } = useApproveCallbackFromTrade(
        trade,
        allowedSlippage
    );

    const priceImpactSeverity = useMemo(() => {
        if (!trade) return 4;
        const realizedLpFeePercent = computeRealizedLPFeePercent(trade);
        const priceImpact = trade.priceImpact.subtract(realizedLpFeePercent);
        return warningSeverity(priceImpact);
    }, [trade]);

    const showApproveFlow =
        !swapInputError &&
        (approvalState === ApprovalState.NOT_APPROVED ||
            approvalState === ApprovalState.PENDING) &&
        !(priceImpactSeverity > 3 && !isExpertMode);

    const { refetch: refetchQuotesA } = useQuotesResults({
        exactInput: true,
        amountIn: parsedAmountA,
        currencyOut: currencies[SwapField.OUTPUT],
    });

    const {
        callback: swapCallback,
        error: swapCallbackError,
        isLoading: isSwapLoading,
        isSuccess: isSwapSuccess,
    } = useSwapCallback(trade, allowedSlippage);

    const handleSwap = useCallback(async () => {
        if (!swapCallback || !parsedAmountB || !currencies) return;
        try {
            const { data } = await refetchQuotesA();
            const quoteResult = data?.[0]?.result as QuoteResult;

            const quoteAmountB = quoteResult[0];

            const parsedQuoteAmountB = CurrencyAmount.fromRawAmount(
                currencies[SwapField.OUTPUT] as Currency,
                quoteAmountB.toString()
            );

            if (parsedQuoteAmountB.toExact() !== parsedAmountB.toExact()) {
                setIsRatesChanged(true);
                return;
            } else {
                setIsRatesChanged(false);
            }

            await swapCallback();
        } catch (error) {
            return new Error(`Swap Failed ${error}`);
        }
    }, [swapCallback, refetchQuotesA, currencies, parsedAmountB]);

    useEffect(() => {
        if (!isSwapSuccess) return;
        refetchQuotesA();
    }, [isSwapSuccess, refetchQuotesA]);

    useEffect(() => {
        if (!isRatesChanged) return;
        setIsRatesChanged(false);
    }, [typedValue]);

    const isValid = !swapInputError;

    const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode;

    const isWrongChain = selectedNetworkId !== DEFAULT_CHAIN_ID;

    if (!account) return <Button onClick={() => open()}>Connect Wallet</Button>;

    if (isWrongChain)
        return (
            <Button
                variant={'destructive'}
                onClick={() => open({ view: 'Networks' })}
            >{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>
        );

    if (showWrap && wrapInputError)
        return <Button disabled>{wrapInputError}</Button>;

    if (showWrap)
        return (
            <Button onClick={() => onWrap && onWrap()}>
                {isWrapLoading ? (
                    <Loader />
                ) : wrapType === WrapType.WRAP ? (
                    'Wrap'
                ) : (
                    'Unwrap'
                )}
            </Button>
        );

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
        return (
            <Button
                disabled={approvalState !== ApprovalState.NOT_APPROVED}
                onClick={() => approvalCallback && approvalCallback()}
            >
                {approvalState === ApprovalState.PENDING ? (
                    <Loader />
                ) : approvalState === ApprovalState.APPROVED ? (
                    'Approved'
                ) : (
                    `Approve ${currencies[SwapField.INPUT]?.symbol}`
                )}
            </Button>
        );

    return (
        <>
            <Button
                onClick={() => handleSwap()}
                disabled={
                    !isValid ||
                    priceImpactTooHigh ||
                    !!swapCallbackError ||
                    isSwapLoading
                }
            >
                {isSwapLoading ? (
                    <Loader />
                ) : swapInputError ? (
                    swapInputError
                ) : priceImpactTooHigh ? (
                    'Price Impact Too High'
                ) : priceImpactSeverity > 2 ? (
                    'Swap Anyway'
                ) : (
                    'Swap'
                )}
            </Button>
            {isRatesChanged && (
                <span className="text-neutral-400 text-sm my-1">
                    Rate was updated.
                </span>
            )}
        </>
    );
};

export default SwapButton;
