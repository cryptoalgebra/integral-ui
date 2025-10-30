import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { DEFAULT_CHAIN_NAME, OMEGA_ROUTER } from "config";
import useWrapCallback, { WrapType } from "@/hooks/swap/useWrapCallback";
import { IDerivedSwapInfo, useSwapState } from "@/state/swapStore";
import { useUserState } from "@/state/userStore";
import { SwapField } from "@/types/swap-field";
import { warningSeverity } from "@/utils/swap/prices";
import { useCallback, useMemo } from "react";
import { useAccount, useChainId } from "wagmi";
import { SmartRouter } from "@cryptoalgebra/router-custom-pools-and-sliding-fee";
import { tryParseAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { useApproveCallbackFromTrade } from "@/hooks/common/useApprove";
import { ApprovalState } from "@/types/approve-state";
import SmartRouterModule from "@/modules/SmartRouterModule";
import { useSwapCallback } from "@/hooks/swap/useSwapCallback";
import { useOmegaSwapCallback } from "@/hooks/swap/useOmegaSwapCallback";
import { TradeState } from "@/types/trade-state";
import { BoostedRoute } from "../../../../sdk-updates/boostedRoute";
import { AllowanceState, usePermit2 } from "@/hooks/common/usePermit2";
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

    const { wrapType, execute: onWrap, loading: isWrapLoading, inputError: wrapInputError } = useWrapCallback(
        currencies[SwapField.INPUT],
        currencies[SwapField.OUTPUT],
        typedValue
    );

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

    const chainId = useChainId();
    const isSmartTrade = trade && "routes" in trade;

    // Determine if we should use OmegaRouter (only for boosted routes)
    const shouldUseOmegaRouter = useMemo(() => {
        if (!trade || isSmartTrade) return false;

        // Check if route is a BoostedRoute
        const route = trade.swaps[0]?.route;
        const isBoostedRoute = route && route instanceof BoostedRoute;

        // Use OmegaRouter ONLY for boosted routes (native router doesn't support Permit2)
        return isBoostedRoute;
    }, [trade, isSmartTrade]);

    // Use Permit2 ONLY for OmegaRouter (native router uses old approve flow)
    const inputAmount = useMemo(() => {
        if (!trade || !shouldUseOmegaRouter || isSmartTrade) return undefined; // Only for OmegaRouter regular trades
        const maxAmount = trade.maximumAmountIn(allowedSlippage);
        // Only return token amounts (Permit2 doesn't work with native currency)
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

    // Get Permit2 signature if available
    const permitSignature = permit2Allowance.state === AllowanceState.ALLOWED ? permit2Allowance.permitSignature : undefined;

    // Use OmegaRouter callback for boosted routes and Permit2-signed swaps
    const { callback: omegaSwapCallback, isLoading: omegaSwapLoading, error: omegaSwapError } = useOmegaSwapCallback(
        shouldUseOmegaRouter && !isSmartTrade ? trade : null,
        allowedSlippage,
        permitSignature
    );

    // Use regular SwapRouter callback for normal routes without Permit2
    const { callback: swapCallback, isLoading: swapLoading, error: swapError } = useSwapCallback(
        !isSmartTrade && !shouldUseOmegaRouter ? trade : null,
        allowedSlippage
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
            } else {
                await swapCallback?.();
            }
        } catch (error) {
            return new Error(`Swap Failed ${error}`);
        }
    }, [swapCallback, smartSwapCallback, omegaSwapCallback, isSmartTrade, shouldUseOmegaRouter]);

    const isValid = !swapInputError && !activeSwapError;

    const priceImpactTooHigh = priceImpactSeverity > 3 && !isExpertMode;

    // Check if we need approval or permit signature (ONLY for OmegaRouter/boosted routes)
    const needsApprovalOrPermit =
        shouldUseOmegaRouter &&
        permit2Allowance.state === AllowanceState.REQUIRED &&
        (permit2Allowance.needsSetupApproval || permit2Allowance.needsPermitSignature);

    // Check if we need standard ERC20 approval (for native/smart router)
    const needsClassicApproval = !shouldUseOmegaRouter && approvalState === ApprovalState.NOT_APPROVED;

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

    // Show standard ERC20 approval button for native/smart router
    if (needsClassicApproval) {
        const isApproving = approvalState === ApprovalState.PENDING;
        return (
            <Button variant={"primary"} onClick={approvalCallback} disabled={isApproving}>
                {isApproving ? <Loader /> : `Approve ${trade?.inputAmount.currency.symbol}`}
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
            <Button
                variant={"primary"}
                onClick={() => handleSwap()}
                disabled={
                    !isValid || priceImpactTooHigh || isSwapLoading || isLoadingRoute || needsApprovalOrPermit || needsClassicApproval
                }
            >
                {isSwapLoading ? (
                    <Loader />
                ) : priceImpactTooHigh ? (
                    "Price Impact Too High"
                ) : priceImpactSeverity > 2 ? (
                    "Swap Anyway"
                ) : swapInputError || activeSwapError ? (
                    swapInputError || activeSwapError
                ) : shouldUseOmegaRouter ? (
                    "Swap (Boosted)"
                ) : (
                    "Swap"
                )}
            </Button>
        </>
    );
};

export default SwapButton;
