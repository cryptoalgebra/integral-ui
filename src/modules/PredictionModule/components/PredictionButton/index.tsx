import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { UserPosition } from "@/graphql/generated/graphql";
import { useApprove } from "@/hooks/common/useApprove";
import { usePredictionBuy } from "../../hooks/usePredictionBuy";
import { usePredictionRedeem } from "../../hooks/usePredictionRedeem";
import { usePredictionSell } from "../../hooks/usePredictionSell";
import { ApprovalState } from "@/types/approve-state";
import { Currency, tryParseAmount } from "@cryptoalgebra/integral-sdk";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { BINARY_LMSR_MARKET_MANAGER, DEFAULT_CHAIN_NAME } from "config";
import { useState } from "react";
import { Address, formatUnits, parseUnits } from "viem";
import { useAccount, useBalance, useChainId } from "wagmi";
import { PredictionMarket } from "../../types";

interface IPredictionButton {
    market: PredictionMarket;
    userPosition: UserPosition | undefined;
    collateralToken: Currency | undefined;
    yesBalance: bigint | undefined;
    noBalance: bigint | undefined;
    amountToPay: string;
    amountToWin: bigint | undefined;
    maxAmountToPay: bigint | undefined;
    side: "yes" | "no";
    action: "buy" | "sell";
    refetch: () => void;
}

export function PredictionButton({
    market,
    userPosition,
    amountToPay,
    maxAmountToPay,
    amountToWin,
    collateralToken,
    side,
    action,
    yesBalance,
    noBalance,
    refetch,
}: IPredictionButton) {
    const appChainId = useChainId();
    const { open } = useAppKit();
    const { chainId: userChainId } = useAppKitNetwork();
    const { address: account } = useAccount();

    const isWrongChain = !userChainId || appChainId !== userChainId;

    const [isRedeemed, setIsRedeemed] = useState(() => userPosition?.redeemed);

    const isTradingEnded = new Date(+market.tradingDeadline * 1000) <= new Date();
    const isResolved = new Date(+market.plannedResolutionTimestamp * 1000) <= new Date();
    const canRedeem = Boolean(isResolved && ((market.outcome === 1 && yesBalance) || (market.outcome === 2 && noBalance)));

    const { buy, isLoading: isBuyLoading } = usePredictionBuy(market, side, refetch);

    const { sell, isLoading: isSellLoading, isSimulating, simulationResult } = usePredictionSell(market, amountToPay, side, refetch);

    const { redeem, isLoading: isRedeemLoading } = usePredictionRedeem(market, () => {
        setIsRedeemed(true);
        refetch();
    });

    const shouldCheckApproval = !!account && !isWrongChain && !isRedeemed && !canRedeem && !isTradingEnded && action === "buy";
    const { approvalState, approvalCallback } = useApprove(
        shouldCheckApproval ? tryParseAmount(amountToPay, collateralToken) : undefined,
        BINARY_LMSR_MARKET_MANAGER[appChainId],
    );
    const needsApproval = shouldCheckApproval && approvalState === ApprovalState.NOT_APPROVED;
    const isApproving = shouldCheckApproval && approvalState === ApprovalState.PENDING;

    const { data: collateralBalance } = useBalance({
        address: account,
        token: collateralToken?.isToken ? (collateralToken.address as Address) : undefined,
        query: { enabled: !!account && action === "buy" && !!collateralToken },
    });

    const parsedBuyAmount = amountToPay && collateralToken ? parseUnits(amountToPay, collateralToken.decimals) : 0n;
    const hasInsufficientCollateral = action === "buy" && !!amountToPay && !!collateralBalance && parsedBuyAmount > collateralBalance.value;

    const parsedSellAmount = amountToPay ? parseUnits(amountToPay, 6) : 0n;
    const availableShares = side === "yes" ? yesBalance ?? 0n : noBalance ?? 0n;
    const hasInsufficientShares = action === "sell" && !!amountToPay && parsedSellAmount > availableShares;

    if (!account) {
        return (
            <Button variant={"primary"} className="w-full" onClick={() => open()}>
                Connect Wallet
            </Button>
        );
    }

    if (isWrongChain) {
        return (
            <Button variant={"destructive"} className="w-full" onClick={() => open({ view: "Networks" })}>
                {`Connect to ${DEFAULT_CHAIN_NAME}`}
            </Button>
        );
    }

    if (canRedeem || isRedeemed) {
        const redeemAmount = market.outcome === 1 ? formatUnits(yesBalance || 0n, 6) : formatUnits(noBalance || 0n, 6);

        return (
            <Button variant={"primary"} className="w-full" onClick={redeem} disabled={!!isRedeemed || isRedeemLoading}>
                {isRedeemLoading ? <Loader /> : isRedeemed ? "Redeemed" : `Redeem ${redeemAmount} USDC`}
            </Button>
        );
    }

    if (isTradingEnded) {
        return (
            <Button variant={"primary"} disabled className="w-full">
                Trading Ended
            </Button>
        );
    }

    if (hasInsufficientCollateral) {
        return (
            <Button variant={"primary"} disabled className="w-full">
                Insufficient {collateralToken?.symbol} balance
            </Button>
        );
    }

    if (hasInsufficientShares) {
        return (
            <Button variant={"primary"} disabled className="w-full">
                Insufficient {side === "yes" ? "YES" : "NO"} balance
            </Button>
        );
    }

    if (needsApproval || isApproving) {
        return (
            <Button variant={"primary"} className="w-full" onClick={approvalCallback} disabled={isApproving}>
                {isApproving ? <Loader /> : `Approve USDC`}
            </Button>
        );
    }

    if (action === "sell") {
        const sellDisabled = !simulationResult && !isSimulating;

        if (sellDisabled) {
            return (
                <Button variant={"primary"} className="w-full" disabled>
                    {amountToPay ? "Insufficient amount" : "Enter amount"}
                </Button>
            );
        }

        return (
            <Button variant={"primary"} className="w-full" onClick={sell} disabled={isSellLoading || isSimulating}>
                {isSellLoading || isSimulating ? <Loader /> : "Sell"}
            </Button>
        );
    }

    const buyDisabled = !amountToWin || !maxAmountToPay || !amountToPay || !collateralToken;

    if (buyDisabled) {
        return (
            <Button variant={"primary"} className="w-full" disabled>
                {amountToPay ? "Insufficient amount" : "Enter amount"}
            </Button>
        );
    }

    return (
        <Button
            variant={"primary"}
            className="w-full"
            onClick={() => amountToWin && maxAmountToPay && buy(amountToWin, maxAmountToPay)}
            disabled={buyDisabled || isBuyLoading}
        >
            {isBuyLoading ? <Loader /> : "Buy"}
        </Button>
    );
}
