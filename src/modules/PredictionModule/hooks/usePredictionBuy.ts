import { useWritePredictionMarketBuyNo, useWritePredictionMarketBuyYes } from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { PredictionMarket } from "../types";

export function usePredictionBuy(market: PredictionMarket, side: "yes" | "no", onSuccess: () => void) {
    const { data: buyNoHash, writeContract: buyNo } = useWritePredictionMarketBuyNo();
    const { data: buyYesHash, writeContract: buyYes } = useWritePredictionMarketBuyYes();

    const { isLoading } = useTransactionAwait(side === "yes" ? buyYesHash : buyNoHash, {
        title: `Buy ${side}`,
        type: TransactionType.SWAP,
        callback: onSuccess,
    });

    const buy = (shares: bigint, maxTotalCost: bigint) => {
        if (side === "no") {
            buyNo({ address: market.id, args: [shares, maxTotalCost] });
        } else {
            buyYes({ address: market.id, args: [shares, maxTotalCost] });
        }
    };

    return { buy, isLoading };
}
