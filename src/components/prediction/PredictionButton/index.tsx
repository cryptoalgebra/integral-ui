import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { useSimulatePredictionMarketSellNo, useSimulatePredictionMarketSellYes, useWritePredictionMarketBuyNo, useWritePredictionMarketBuyYes, useWritePredictionMarketRedeem, useWritePredictionMarketSellNo, useWritePredictionMarketSellYes } from "@/generated";
import { UserPosition } from "@/graphql/generated/graphql";
import { useApprove } from "@/hooks/common/useApprove";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { ApprovalState } from "@/types/approve-state";
import { PredictionMarket } from "@/types/prediction";
import { Currency, tryParseAmount } from "@cryptoalgebra/integral-sdk";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { DEFAULT_CHAIN_NAME } from "config";
import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useChainId } from "wagmi";

interface IPredictionButton {
    market: PredictionMarket;
    userPosition: UserPosition | undefined;
    collateralToken: Currency | undefined;
    balance: bigint | undefined;
    yesBalance: bigint | undefined;
    noBalance: bigint | undefined;
    amountToPay: string;
    shares: bigint | undefined;
    maxTotalCost: bigint | undefined;
    side: "yes" | "no";
    action: "buy" | "sell";
    refetch: () => void;
}

const PredictionButton = ({ market, amountToPay, shares, maxTotalCost, collateralToken, side, action, yesBalance, noBalance, userPosition, refetch }: IPredictionButton) => {

    const appChainId = useChainId();

    const { chainId: userChainId } = useAppKitNetwork();
    const { open } = useAppKit();

    const { address: account } = useAccount();

    const isWrongChain = !userChainId || appChainId !== userChainId;

    const { approvalState, approvalCallback } = useApprove(
        tryParseAmount(amountToPay, collateralToken),
        market.id
    )

    const [isRedeemed, setIsRedeemed] = useState(() => userPosition?.redeemed)

    const needsApproval = approvalState === ApprovalState.NOT_APPROVED;
    const isApproving = approvalState === ApprovalState.PENDING;

    const { data: buyNoHash, writeContractAsync: buyNo } = useWritePredictionMarketBuyNo()
    const { data: buyYesHash, writeContractAsync: buyYes } = useWritePredictionMarketBuyYes()

    const { isLoading: isBuyLoading } = useTransactionAwait(side === "yes" ? buyYesHash : buyNoHash, {
        title: `Buy ${side}`,
        type: TransactionType.SWAP,
    })

    const { data: sellYesAmount, isLoading: isSellYesLoading } = useSimulatePredictionMarketSellYes({
        address: market?.id,
        args: amountToPay ? [parseUnits(amountToPay, 6), 0n] : undefined
    })
    const { data: sellNoAmount, isLoading: isSellNoLoading } = useSimulatePredictionMarketSellNo({
        address: market?.id,
        args: amountToPay ? [parseUnits(amountToPay, 6), 0n] : undefined
    })

    const { data: sellYesHash, writeContractAsync: sellYes } = useWritePredictionMarketSellYes()
    const { data: sellNoHash, writeContractAsync: sellNo } = useWritePredictionMarketSellNo()

    const { isLoading: isSellLoading } = useTransactionAwait(side === "yes" ? sellYesHash : sellNoHash, {
        title: `Sell ${side}`,
        type: TransactionType.SWAP,
    })

    const { data: redeemHash, writeContractAsync: redeem } = useWritePredictionMarketRedeem();
    const { isLoading: isRedeemLoading } = useTransactionAwait(redeemHash, {
        title: 'Redeem',
        type: TransactionType.SWAP
    })

    const sellDisabled = action === "sell" && (Boolean(side === "no" && !sellNoAmount?.result && !isSellNoLoading) || Boolean(side === "yes" && !sellYesAmount?.result && !isSellYesLoading))

    const handleBuy = async () => {

        if (!shares || !maxTotalCost) return

        if (side === "no") {
            await buyNo({
                address: market.id,
                args: [shares, maxTotalCost]
            })
        }

        if (side === "yes") {
            await buyYes({
                address: market.id,
                args: [shares, maxTotalCost]
            })
        }

        refetch()
    }

    const handleSell = async () => {

        if (!amountToPay) return

        if (side === "no" && !sellNoAmount?.result) return
        if (side === "yes" && !sellYesAmount?.result) return

        if (side === "no") {
            await sellNo({
                address: market.id,
                args: [parseUnits(amountToPay, 6), sellNoAmount!.result]
            })
        }

        if (side === "yes") {
            await sellYes({
                address: market.id,
                args: [parseUnits(amountToPay, 6), sellYesAmount!.result]
            })
        }

        refetch()

    }

    const handleRedeem = async () => {
        if (!market) return

        await redeem({
            address: market.id
        })

        setIsRedeemed(true)

        refetch()
    }

    const isValid = Boolean(shares && maxTotalCost && amountToPay && market && collateralToken);
    const isTradeLoading = isBuyLoading || isSellLoading;

    const isTradingEnded = new Date(+market.tradingDeadline * 1000) <= new Date()
    const isResolved = new Date(+market.plannedResolutionTimestamp * 1000) <= new Date()

    if (!account)
        return (
            <Button variant={"primary"} className="w-full" onClick={() => open()}>
                Connect Wallet
            </Button>
        );


    if (isWrongChain)
        return <Button variant={"destructive"} className="w-full" onClick={() => open({ view: "Networks" })}>{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>;


    if (isRedeemed)
        return (
            <Button  variant={"primary"} className="w-full" disabled={true}>
                Redeemed
            </Button>
        )

    if (isResolved && ((market.outcome === 1 && yesBalance) || (market.outcome === 2 && noBalance)))
        return (
            <Button  variant={"primary"} className="w-full" onClick={handleRedeem} disabled={isRedeemLoading}>
                {isRedeemLoading ? <Loader /> : `Redeem ${market.outcome === 1 ? formatUnits(yesBalance || 0n, 6) : formatUnits(noBalance || 0n, 6)} USDC`}
            </Button>
        )

    if (isTradingEnded)
        return (
            <Button variant={"primary"} disabled className="w-full">
                Trading Ended
            </Button>)

    if ((needsApproval || isApproving) && action === "buy") {
        return (
            <Button variant={"primary"} className="w-full" onClick={approvalCallback} disabled={isApproving}>
                {isApproving ? <Loader /> : `Approve USDC`}
            </Button>
        );
    }

    if (sellDisabled)
        return (
            <Button  variant={"primary"} className="w-full" disabled={true}>
                Insufficient amount
            </Button>
        )

    return (
        <Button
            variant={"primary"}
            className="w-full"
            onClick={() => action === "buy" ? handleBuy() : handleSell()}
            disabled={
                !isValid || isTradeLoading || sellDisabled
            }
        >
            {isTradeLoading ? (
                <Loader />
            ) : (
                action === "buy" ? "Buy" : "Sell"
            )}
        </Button>
    );

};

export default PredictionButton;