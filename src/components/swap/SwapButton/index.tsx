import { Button } from "@/components/ui/button";
import { useApproveCallbackFromTrade } from "@/hooks/common/useApprove";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { useSwapCallback } from "@/hooks/swap/useSwapCallback";
import { useDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { ApprovalState } from "@/types/approve-state";
import { SwapField } from "@/types/swap-field";
import { TradeState } from "@/types/trade-state";
import { Currency, Percent, Trade, TradeType } from "@cryptoalgebra/integral-sdk";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

const SwapButton = () => {

    const { open } = useWeb3Modal()

    const { address: account } = useAccount()

    const { independentField, typedValue } = useSwapState();
    const { tradeState, toggledTrade: trade, allowedSlippage, currencyBalances, parsedAmount, currencies, inputError: swapInputError, poolFee } = useDerivedSwapInfo();

    // const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue);

    // const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE;
    const showWrap: boolean = false;

    const parsedAmounts = useMemo(
        () =>
            showWrap
                ? {
                      [SwapField.INPUT]: parsedAmount,
                      [SwapField.OUTPUT]: parsedAmount,
                  }
                : {
                      [SwapField.INPUT]: independentField === SwapField.INPUT ? parsedAmount : trade?.inputAmount,
                      [SwapField.OUTPUT]: independentField === SwapField.OUTPUT ? parsedAmount : trade?.outputAmount,
                  },
        [independentField, parsedAmount, showWrap, trade]
    );

    const userHasSpecifiedInputOutput = Boolean(currencies[SwapField.INPUT] && currencies[SwapField.OUTPUT] && independentField !== SwapField.LIMIT_ORDER_PRICE && parsedAmounts[independentField]?.greaterThan('0'));

    const routeNotFound = !trade?.route;
    const isLoadingRoute = TradeState.LOADING === tradeState.state;

    // const [singleHopOnly] = useUserSingleHopOnly();
    const singleHopOnly = false

    const fiatValueInput = useUSDCValue(parsedAmounts[SwapField.INPUT]);
    const fiatValueOutput = useUSDCValue(parsedAmounts[SwapField.OUTPUT]);
    // const priceImpact = computeFiatValuePriceImpact(fiatValueInput, fiatValueOutput);
    const priceImpact = new Percent('1');

    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false);

    const { approvalState, approvalCallback } = useApproveCallbackFromTrade(trade, allowedSlippage);

    // const [isExpertMode] = useExpertModeManager();
    const isExpertMode = false

    

    useEffect(() => {
        if (approvalState === ApprovalState.PENDING) {
            setApprovalSubmitted(true);
        }
    }, [approvalState, approvalSubmitted]);

    useEffect(() => {
        setApprovalSubmitted(false);
    }, [currencies[SwapField.INPUT]]);

    // warnings on the greater of fiat value price impact and execution price impact
    const priceImpactSeverity = useMemo(() => {
        const executionPriceImpact = trade?.priceImpact;
        // return warningSeverity(executionPriceImpact && priceImpact ? (executionPriceImpact.greaterThan(priceImpact) ? executionPriceImpact : priceImpact) : executionPriceImpact ?? priceImpact);
        return 0
    }, [priceImpact, trade]);

    // show approve flow when: no error on inputs, not approved or pending, or approved in current session
    // never show if price impact is above threshold in non expert mode
    const showApproveFlow =
        !swapInputError &&
        (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING || (approvalSubmitted && approvalState === ApprovalState.APPROVED)) &&
        !(priceImpactSeverity > 3 && !isExpertMode);

    // const { state: signatureState, signatureData, gatherPermitSignature } = useERC20PermitFromTrade(trade, allowedSlippage);

    // const handleApprove = useCallback(async () => {
    //     if (signatureState === UseERC20PermitState.NOT_SIGNED && gatherPermitSignature) {
    //         try {
    //             await gatherPermitSignature();
    //         } catch (error: any) {
    //             // try to approve if gatherPermitSignature failed for any reason other than the user rejecting it
    //             if (error?.code !== 4001) {
    //                 await approveCallback();
    //             }
    //         }
    //     } else {
    //         await approveCallback();
    //     }
    // }, [approveCallback, gatherPermitSignature, signatureState]);

    // modal and loading
    const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
        showConfirm: boolean;
        tradeToConfirm: Trade<Currency, Currency, TradeType> | undefined;
        attemptingTxn: boolean;
        swapErrorMessage: string | undefined;
        txHash: string | undefined;
    }>({
        showConfirm: false,
        tradeToConfirm: undefined,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        txHash: undefined,
    });

    const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage);

    const handleSwap = useCallback(() => {
        if (!swapCallback) {
            return;
        }
        // if (priceImpact && !confirmPriceImpactWithoutFee(priceImpact)) {
        //     return;
        // }
        setSwapState({
            attemptingTxn: true,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: undefined,
            txHash: undefined,
        });
        swapCallback()
            .then(({hash}) => {
                setSwapState({
                    attemptingTxn: false,
                    tradeToConfirm,
                    showConfirm,
                    swapErrorMessage: undefined,
                    txHash: hash,
                });
            })
            .catch((error) => {
                setSwapState({
                    attemptingTxn: false,
                    tradeToConfirm,
                    showConfirm,
                    swapErrorMessage: error.message,
                    txHash: undefined,
                });
            });
    }, [swapCallback, priceImpact, tradeToConfirm, showConfirm, account, trade, singleHopOnly]);

    const isValid = !swapInputError;

    const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode;

    if (!account) {
        return (
            // <Button  onClick={() => toast({
            //     title: 'Swap',
            //     description: 'Tx was sent',
            //     action: <ToastAction altText="View Tx">View TX</ToastAction>
            // })}>
            //     Connect Wallet
            // </Button>
            <Button onClick={() => open()}>Connect Wallet</Button>
        );
    }

    // if (showWrap) {
    //     return (
    //         <button className={"btn primary w-100 pv-1 b"} disabled={Boolean(wrapInputError)} onClick={onWrap}>
    //             {wrapInputError ?? (wrapType === WrapType.WRAP ? <Trans>Wrap</Trans> : wrapType === WrapType.UNWRAP ? <Trans>Unwrap</Trans> : null)}
    //         </button>
    //     );
    // }

    if (routeNotFound && userHasSpecifiedInputOutput)
        return (
            <button className={`btn primary w-100 pv-1 b`} disabled={true}>
                <div>
                    <div>
                        {isLoadingRoute ? (
                                'Loading'
                        ) : singleHopOnly ? (
                            'Insufficient liquidity for this trade. Try enabling multi-hop trades.'
                        ) : (
                            'Insufficient liquidity for this trade.'
                        )}
                    </div>
                </div>
            </button>
        );

    if (showApproveFlow)
        return (
            <div className="swap-button__approve-flow">
                <button
                    className={`w-100 b f f-ac f-jc swap-button__approve-button ${approvalState !== ApprovalState.APPROVED ? "btn primary" : ""}`}
                    onClick={() => approvalCallback && approvalCallback()}
                    disabled={approvalState !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                >
                    {approvalState === ApprovalState.PENDING ? (
                        // <Loader stroke="white" style={{ marginLeft: "5px" }} />
                        'Loading'
                    ) : approvalState === ApprovalState.APPROVED ? (
                        // <CheckCircle size="20" style={{ marginLeft: "5px" }} color={"var(--green)"} />
                        'Checked'
                    ) : (
                        <div></div>
                    )}
                    <span className="ml-05">
                        {approvalState === ApprovalState.APPROVED  ? (
                            <div>1. {currencies[SwapField.INPUT]?.symbol} is approved</div>
                        ) : (
                            <div>1. Approve {currencies[SwapField.INPUT]?.symbol}</div>
                        )}
                    </span>
                </button>
                <button
                    onClick={() => {
                        // if (isExpertMode) {
                        handleSwap();
                        // } else {
                        setSwapState({
                            //@ts-ignore
                            tradeToConfirm: trade,
                            attemptingTxn: false,
                            swapErrorMessage: undefined,
                            showConfirm: true,
                            txHash: undefined,
                        });
                    }}
                    id="swap-button"
                    className="btn primary w-100 pv-1 b"
                    disabled={!isValid || (approvalState !== ApprovalState.APPROVED || priceImpactTooHigh)}
                >
                    {priceImpactTooHigh ? 'High Price Impact' : priceImpactSeverity > 2 ? '2. Swap Anyway' : '2. Swap'}
                </button>
            </div>
        );

    return (
        <button
            onClick={() => {
                // if (isExpertMode) {
                handleSwap();
                // } else {
                setSwapState({
                    //@ts-ignore
                    tradeToConfirm: trade,
                    attemptingTxn: false,
                    swapErrorMessage: undefined,
                    showConfirm: true,
                    txHash: undefined,
                });
                // }
            }}
            id="swap-button"
            className="w-full bg-primary-button p-4 font-bold rounded-2xl"
            disabled={!isValid || priceImpactTooHigh || !!swapCallbackError}
            // error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
        >
            <span>{swapInputError ? swapInputError : priceImpactTooHigh ? 'Price Impact Too High' : priceImpactSeverity > 2 ? 'Swap Anyway' : 'Swap'}</span>
        </button>
    );

}

export default SwapButton;