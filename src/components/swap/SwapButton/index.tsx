import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { DEFAULT_CHAIN_NAME, enabledModules, OMEGA_ROUTER } from "config";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import { IDerivedSwapInfo, RouterType, useSwapState } from "@/state/swapStore";
import { SwapField } from "@/types/swap-field";
import { warningSeverity } from "@/utils/swap/prices";
import { useCallback, useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { SmartRouter } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { tryParseAmount, BoostedRouteStepType, Currency } from "@cryptoalgebra/integral-sdk";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { useApproveCallbackFromTrade } from "@/hooks/common/useApprove";
import { ApprovalState } from "@/types/approve-state";
import { useSwapCallback } from "@/hooks/swap/useSwapCallback";
import { TradeState } from "@/types/trade-state";
import { KycStatus } from "@/types/kyc";
import { AlertTriangle } from "lucide-react";

import SmartRouterModule from "@/modules/SmartRouterModule";
const { useSmartRouterCallback } = SmartRouterModule.hooks;

import BoostedPoolsModule from "@/modules/BoostedPoolsModule";
const { useOmegaSwapCallback, usePermit2 } = BoostedPoolsModule.hooks;

import KYCModule from "@/modules/KYCModule";
const { KycVerificationModal } = KYCModule.components;
const { useTradeKycGate, useKycIdentity } = KYCModule.hooks;

export enum AllowanceState {
    LOADING = 0,
    REQUIRED = 1,
    ALLOWED = 2,
}

const SwapButton = ({ derivedSwap }: { derivedSwap: IDerivedSwapInfo }) => {
    const { open } = useAppKit();

    const appChainId = useChainId();

    const { chainId: userChainId } = useAppKitNetwork();

    const { address: account } = useAccount();
    const [isKycModalOpen, setIsKycModalOpen] = useState(false);

    const { independentField, typedValue, routerType } = useSwapState();
    const {
        allowedSlippage,
        parsedAmount,
        currencies,
        inputError: swapInputError,
        currencyBalances,
        toggledTrade: trade,
        tradeState,
        smartTradeCallOptions,
        refetchBalances,
        priceImpact: derivedPriceImpact,
        kycQuoteState,
    } = derivedSwap;

    const isSmartTrade = trade && "routes" in trade;
    const kycGate = useTradeKycGate(trade);
    const isTradeKycRequired = enabledModules.KYCModule && Boolean(kycGate.isKycRequired);
    const hasKycContext = isTradeKycRequired || kycQuoteState.hasLockedKycRoutes;
    const kycIdentity = useKycIdentity(hasKycContext);

    const erc4626WrapType = useMemo(() => {
        if (isSmartTrade || !trade || !trade.swaps[0].route.isBoosted) return null;

        const steps = trade.swaps[0].route.steps;
        // Only pure wrap/unwrap if there's exactly one step and it's WRAP or UNWRAP
        if (steps.length === 1) {
            if (steps[0].type === BoostedRouteStepType.WRAP) return BoostedRouteStepType.WRAP;
            if (steps[0].type === BoostedRouteStepType.UNWRAP) return BoostedRouteStepType.UNWRAP;
        }
        return null;
    }, [trade, isSmartTrade]);

    const tradeInputCurrency = trade?.inputAmount?.currency as Currency | undefined;
    const tradeOutputCurrency = trade?.outputAmount?.currency as Currency | undefined;

    const parsedAmountA =
        independentField === SwapField.INPUT ? parsedAmount : tryParseAmount(trade?.inputAmount?.toSignificant(), tradeInputCurrency);

    const parsedAmountB =
        independentField === SwapField.OUTPUT ? parsedAmount : tryParseAmount(trade?.outputAmount?.toSignificant(), tradeOutputCurrency);

    const parsedAmounts = useMemo(
        () => ({
            [SwapField.INPUT]: parsedAmountA,
            [SwapField.OUTPUT]: parsedAmountB,
        }),
        [parsedAmountA, parsedAmountB],
    );

    const userHasSpecifiedInputOutput = Boolean(
        currencies[SwapField.INPUT] &&
            currencies[SwapField.OUTPUT] &&
            independentField !== SwapField.LIMIT_ORDER_PRICE &&
            parsedAmounts[independentField]?.greaterThan("0"),
    );

    const isLoadingRoute = tradeState.state === TradeState.LOADING;
    const routeNotFound = !trade;
    const insufficientBalance =
        currencyBalances[SwapField.INPUT] &&
        trade?.inputAmount &&
        currencyBalances[SwapField.INPUT]?.lessThan(trade.inputAmount.quotient.toString());

    const chainId = useChainId();

    const shouldUseOmegaRouter =
        !isSmartTrade && enabledModules.BoostedPoolsModule && routerType === RouterType.OMEGA;

    const inputAmount = useMemo(() => {
        if (!trade || !shouldUseOmegaRouter || isSmartTrade) return undefined;
        const maxAmount = trade.maximumAmountIn(allowedSlippage);
        // Permit2 doesn't work with native currency
        if (!maxAmount || maxAmount.currency.isNative) return undefined;
        return maxAmount;
    }, [trade, allowedSlippage, shouldUseOmegaRouter, isSmartTrade]);

    const permit2Allowance = usePermit2({
        amount: inputAmount,
        spender: OMEGA_ROUTER[chainId], // OmegaRouter address (Permit2 spender)
    });

    // Use standard ERC20 approve for native/smart router (not boosted routes)
    const { approvalState, approvalCallback } = useApproveCallbackFromTrade(!shouldUseOmegaRouter ? trade : null, allowedSlippage);

    const priceImpact = useMemo(() => {
        if (!trade) return undefined;

        if (isSmartTrade) {
            return SmartRouter.getPriceImpact(trade);
        } else {
            return derivedPriceImpact;
        }
    }, [trade, isSmartTrade, derivedPriceImpact]);

    const priceImpactSeverity = useMemo(() => {
        if (!priceImpact) return 0;
        return warningSeverity(priceImpact);
    }, [priceImpact]);

    const permitSignature = permit2Allowance.state === AllowanceState.ALLOWED ? permit2Allowance.permitSignature : undefined;
    const refetchPermit2Data = permit2Allowance.state !== AllowanceState.LOADING ? permit2Allowance.refetchPermit2Data : undefined;

    // Check if we need approval or permit signature (ONLY for OmegaRouter/boosted routes)
    const needsApprovalOrPermit =
        shouldUseOmegaRouter &&
        permit2Allowance.state === AllowanceState.REQUIRED &&
        (permit2Allowance.needsSetupApproval || permit2Allowance.needsPermitSignature);

    const onTransactionSuccess = useCallback(() => {
        refetchBalances();
        tradeState.refetch();

        if (shouldUseOmegaRouter) {
            refetchPermit2Data?.();
        }
    }, [refetchBalances, tradeState, refetchPermit2Data, shouldUseOmegaRouter]);

    const { wrapType, execute: onWrap, loading: isWrapLoading, inputError: wrapInputError } = useWrapCallback(
        currencies[SwapField.INPUT],
        currencies[SwapField.OUTPUT],
        typedValue,
        onTransactionSuccess,
    );

    const showWrap = wrapType !== WrapType.NOT_APPLICABLE;

    const { callback: smartSwapCallback, isLoading: smartSwapLoading } = useSmartRouterCallback(
        tradeInputCurrency,
        tradeOutputCurrency,
        trade?.inputAmount?.toFixed(),
        smartTradeCallOptions.calldata,
        smartTradeCallOptions.value,
        onTransactionSuccess,
    );

    // Use OmegaRouter callback for boosted routes and Permit2-signed swaps
    const { callback: omegaSwapCallback, isLoading: omegaSwapLoading, error: omegaSwapError } = useOmegaSwapCallback(
        shouldUseOmegaRouter && !isSmartTrade ? (!needsApprovalOrPermit ? trade : null) : null,
        allowedSlippage,
        permitSignature,
        onTransactionSuccess,
    );

    // Use regular SwapRouter callback for normal routes without Permit2
    const { callback: swapCallback, isLoading: swapLoading, error: swapError } = useSwapCallback(
        !isSmartTrade && !shouldUseOmegaRouter ? trade : null,
        allowedSlippage,
        onTransactionSuccess,
        approvalState !== ApprovalState.APPROVED,
    );

    const isSwapLoading = swapLoading || smartSwapLoading || omegaSwapLoading;
    const activeSwapError = shouldUseOmegaRouter ? omegaSwapError : swapError;

    const handleSwap = useCallback(async () => {
        if (!swapCallback && !smartSwapCallback && !omegaSwapCallback) return;

        try {
            if (isSmartTrade) {
                await smartSwapCallback?.();
            } else if (shouldUseOmegaRouter) {
                await omegaSwapCallback?.();
                if (permit2Allowance.state === AllowanceState.ALLOWED) {
                    permit2Allowance.removePermitSign();
                }
            } else {
                await swapCallback?.();
            }
        } catch (error) {
            return new Error(`Swap Failed ${error}`);
        }
    }, [swapCallback, smartSwapCallback, omegaSwapCallback, isSmartTrade, shouldUseOmegaRouter, permit2Allowance]);

    const isValid = !swapInputError && !activeSwapError;

    const hasLargePriceDifference = priceImpactSeverity > 2;
    const approvalTokenSymbol = trade?.inputAmount.currency.symbol ?? "token";

    const largePriceDifferencePercent = useMemo(() => {
        if (!priceImpact) return "0.00";

        const priceDifferenceValue = Number(priceImpact.toFixed(2));
        if (!Number.isFinite(priceDifferenceValue)) return "0.00";

        return Math.abs(priceDifferenceValue).toFixed(2);
    }, [priceImpact]);

    // Check if we need standard ERC20 approval (for native/smart router)
    const isResetApprovalRequired = approvalState === ApprovalState.RESET_REQUIRED;
    const needsClassicApproval =
        !shouldUseOmegaRouter && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.RESET_REQUIRED);
    const isApproving = approvalState === ApprovalState.PENDING;

    const isWrongChain = !userChainId || appChainId !== userChainId;

    if (!account)
        return (
            <Button variant={"primary"} onClick={() => open()}>
                Connect Wallet
            </Button>
        );

    if (isWrongChain)
        return <Button variant={"destructive"} onClick={() => open({ view: "Networks" })}>{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>;

    if (showWrap && wrapInputError) return <Button disabled>{wrapInputError}</Button>;

    if (showWrap)
        return (
            <Button variant={"primary"} onClick={() => onWrap && onWrap()}>
                {isWrapLoading ? <Loader /> : wrapType === WrapType.WRAP ? "Wrap" : "Unwrap"}
            </Button>
        );

    if (kycQuoteState.isError && userHasSpecifiedInputOutput)
        return (
            <Button variant="outline" onClick={() => kycQuoteState.refetch()}>
                Retry KYC check
            </Button>
        );

    if (kycQuoteState.isLoading && userHasSpecifiedInputOutput)
        return (
            <Button variant="primary" disabled>
                <Loader /> Checking pool requirements
            </Button>
        );

    if (routeNotFound && kycQuoteState.hasLockedKycRoutes && userHasSpecifiedInputOutput) {
        const verificationButton =
            kycIdentity.status === KycStatus.ERROR ? (
                <Button variant="outline" onClick={() => kycIdentity.refetch?.()}>
                    Retry KYC status
                </Button>
            ) : kycIdentity.status === KycStatus.VERIFIED ? (
                <Button variant="outline" onClick={() => void Promise.all([kycQuoteState.refetch(), kycGate.refetch()])}>
                    Retry KYC check
                </Button>
            ) : (
                <Button variant="primary" onClick={() => setIsKycModalOpen(true)} disabled={kycIdentity.isLoading}>
                    {kycIdentity.isLoading ? (
                        <Loader />
                    ) : kycIdentity.status === KycStatus.IDENTITY_REQUIRED ? (
                        "Deploy Onchain ID"
                    ) : (
                        "Complete verification"
                    )}
                </Button>
            );

        return (
            <>
                {verificationButton}
                <KycVerificationModal
                    open={isKycModalOpen}
                    onOpenChange={setIsKycModalOpen}
                    identity={kycIdentity}
                    onStatusChange={() => void Promise.all([kycQuoteState.refetch(), kycGate.refetch()])}
                />
            </>
        );
    }

    if (routeNotFound && userHasSpecifiedInputOutput)
        return (
            <Button variant={"primary"} disabled>
                {isLoadingRoute ? <Loader /> : "Insufficient liquidity for this trade."}
            </Button>
        );

    if (trade && insufficientBalance) {
        return (
            <Button variant={"primary"} disabled>
                {isLoadingRoute ? <Loader /> : `Insufficient ${trade.inputAmount.currency.symbol} amount`}
            </Button>
        );
    }

    if (trade && enabledModules.KYCModule && kycGate.isLoading)
        return (
            <Button variant="primary" disabled>
                <Loader /> Checking pool requirements
            </Button>
        );

    if (trade && enabledModules.KYCModule && kycGate.isError)
        return (
            <Button variant="outline" onClick={() => kycGate.refetch?.()}>
                Retry KYC check
            </Button>
        );

    if (trade && isTradeKycRequired && !kycGate.canSwap)
        return (
            <>
                <Button
                    variant="primary"
                    onClick={() => setIsKycModalOpen(true)}
                    disabled={kycIdentity.isLoading || kycIdentity.status === KycStatus.VERIFIED}
                >
                    {kycIdentity.isLoading ? (
                        <Loader />
                    ) : kycIdentity.status === KycStatus.IDENTITY_REQUIRED ? (
                        "Deploy Onchain ID"
                    ) : kycIdentity.status === KycStatus.VERIFIED ? (
                        "KYC access required"
                    ) : (
                        "Complete verification"
                    )}
                </Button>
                <KycVerificationModal
                    open={isKycModalOpen}
                    onOpenChange={setIsKycModalOpen}
                    identity={kycIdentity}
                    onStatusChange={() => void Promise.all([kycQuoteState.refetch(), kycGate.refetch()])}
                />
            </>
        );

    // Show standard ERC20 approval button for native/smart router
    if (needsClassicApproval || isApproving) {
        return (
            <Button variant={"primary"} onClick={approvalCallback} disabled={isApproving}>
                {isApproving ? (
                    <Loader />
                ) : isResetApprovalRequired ? (
                    `Reset ${approvalTokenSymbol} approval`
                ) : (
                    `Approve ${approvalTokenSymbol}`
                )}
            </Button>
        );
    }

    // Show approval or permit button (for OmegaRouter/boosted routes)
    if (needsApprovalOrPermit) {
        const {
            needsSetupApproval,
            needsPermitSignature,
            approveAndPermit,
            token,
            isLoading: isPermitOrApprovalLoading,
        } = permit2Allowance;

        if (needsSetupApproval && needsPermitSignature) {
            return (
                <Button variant={"primary"} onClick={approveAndPermit} disabled={isPermitOrApprovalLoading}>
                    {isPermitOrApprovalLoading ? <Loader /> : "Approve & Sign Permit"}
                </Button>
            );
        }

        if (needsSetupApproval) {
            return (
                <Button variant={"primary"} onClick={permit2Allowance.approve} disabled={isPermitOrApprovalLoading}>
                    {isPermitOrApprovalLoading ? <Loader /> : `Approve ${token.symbol}`}
                </Button>
            );
        }

        if (needsPermitSignature) {
            return (
                <Button variant={"primary"} onClick={permit2Allowance.permit} disabled={isPermitOrApprovalLoading}>
                    {isPermitOrApprovalLoading ? <Loader /> : "Sign Permit"}
                </Button>
            );
        }
    }

    return (
        <>
            {hasLargePriceDifference && (
                <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>High price impact: {largePriceDifferencePercent}%. You may receive significantly fewer tokens than expected.</p>
                </div>
            )}
            <Button
                variant={hasLargePriceDifference ? "destructive" : "primary"}
                onClick={() => handleSwap()}
                disabled={!isValid || isSwapLoading || isLoadingRoute || needsApprovalOrPermit || needsClassicApproval}
            >
                {isSwapLoading ? (
                    <Loader />
                ) : hasLargePriceDifference ? (
                    "Proceed with trade"
                ) : priceImpactSeverity > 2 ? (
                    "Swap Anyway"
                ) : swapInputError || activeSwapError ? (
                    swapInputError || activeSwapError
                ) : erc4626WrapType === BoostedRouteStepType.WRAP ? (
                    "Wrap"
                ) : erc4626WrapType === BoostedRouteStepType.UNWRAP ? (
                    "Unwrap"
                ) : (
                    "Swap"
                )}
            </Button>
        </>
    );
};

export default SwapButton;
