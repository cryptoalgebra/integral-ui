import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { useSimulatePredictionMarketSellNo, useSimulatePredictionMarketSellYes, useWritePredictionMarketBuyNo, useWritePredictionMarketBuyYes, useWritePredictionMarketSellNo, useWritePredictionMarketSellYes } from "@/generated";
import { useApprove } from "@/hooks/common/useApprove";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { ApprovalState } from "@/types/approve-state";
import { PredictionMarket } from "@/types/prediction";
import { Currency, tryParseAmount } from "@cryptoalgebra/integral-sdk";
import { useAppKit, useAppKitNetwork } from "@reown/appkit/react";
import { DEFAULT_CHAIN_NAME } from "config";
import { parseUnits } from "viem";
import { useAccount, useChainId } from "wagmi";

interface IPredictionButton {
    market: PredictionMarket;
    collateralToken: Currency | undefined;
    balance: bigint | undefined;
    amountToPay: string;
    shares: bigint | undefined;
    maxTotalCost: bigint | undefined;
    side: "yes" | "no";
    action: "buy" | "sell";
}

const PredictionButton = ({ market, amountToPay, shares, maxTotalCost, collateralToken, side, action }: IPredictionButton) => {

    const appChainId = useChainId();

    const { chainId: userChainId } = useAppKitNetwork();
    const { open } = useAppKit();

    const { address: account } = useAccount();

    const isWrongChain = !userChainId || appChainId !== userChainId;

    const { approvalState, approvalCallback } = useApprove(
        tryParseAmount(amountToPay, collateralToken),
        market.id
    )

    const needsApproval = approvalState === ApprovalState.NOT_APPROVED;
    const isApproving = approvalState === ApprovalState.PENDING;

    const { data: buyNoHash, writeContractAsync: buyNo } = useWritePredictionMarketBuyNo()
    const { data: buyYesHash, writeContractAsync: buyYes } = useWritePredictionMarketBuyYes()

    const { isLoading: isBuyLoading } = useTransactionAwait(side === "yes" ? buyYesHash : buyNoHash, {
        title: `Buy ${side}`,
        type: TransactionType.SWAP,
    })

    const { data: sellYesAmount } = useSimulatePredictionMarketSellYes({
        address: market?.id,
        args: amountToPay ? [parseUnits(amountToPay, 6), 0n] : undefined
    })
    const { data: sellNoAmount } = useSimulatePredictionMarketSellNo({
        address: market?.id,
        args: amountToPay ? [parseUnits(amountToPay, 6), 0n] : undefined
    })

    const { data: sellYesHash, writeContractAsync: sellYes } = useWritePredictionMarketSellYes()
    const { data: sellNoHash, writeContractAsync: sellNo } = useWritePredictionMarketSellNo()

    const { isLoading: isSellLoading } = useTransactionAwait(side === "yes" ? sellYesHash : sellNoHash, {
        title: `Sell ${side}`,
        type: TransactionType.SWAP,
    })

    const handleTrade = async () => {

        if (!shares || !maxTotalCost) return

        if (side === "no") {
            buyNo({
                address: market.id,
                args: [shares, maxTotalCost]
            })
        }

        if (side === "yes") {
            buyYes({
                address: market.id,
                args: [shares, maxTotalCost]
            })
        }
    }

    const handleSell = async () => {

        if (!amountToPay) return

        if (side === "no" && !sellNoAmount?.result) return
        if (side === "yes" && !sellYesAmount?.result) return

        if (side === "no") {
            sellNo({
                address: market.id,
                args: [parseUnits(amountToPay, 6), sellNoAmount!.result]
            })
        }

        if (side === "yes") {
            sellYes({
                address: market.id,
                args: [parseUnits(amountToPay, 6), sellYesAmount!.result]
            })
        }

    }

    const isValid = Boolean(shares && maxTotalCost && amountToPay && market && collateralToken);
    const isTradeLoading = isBuyLoading || isSellLoading;

    const isTradingEnded = new Date(+market.tradingDeadline * 1000) <= new Date()

    if (!account)
        return (
            <Button variant={"primary"} className="w-full" onClick={() => open()}>
                Connect Wallet
            </Button>
        );


    if (isWrongChain)
        return <Button variant={"destructive"} className="w-full" onClick={() => open({ view: "Networks" })}>{`Connect to ${DEFAULT_CHAIN_NAME}`}</Button>;


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

    return (
        <Button
            variant={"primary"}
            className="w-full"
            onClick={() => action === "buy" ? handleTrade() : handleSell()}
            disabled={
                !isValid || isTradeLoading
            }
        >
            {isTradeLoading ? (
                <Loader />
            ) : (
                action === "buy" ? "Trade" : "Sell"
            )}
        </Button>
    );

};

export default PredictionButton;