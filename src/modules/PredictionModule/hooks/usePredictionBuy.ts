import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { PredictionMarket } from "../types";
import { useWriteBinaryLmsrMarketManagerBuyNo, useWriteBinaryLmsrMarketManagerBuyYes } from "@/generated";

export function usePredictionBuy(market: PredictionMarket, side: "yes" | "no", onSuccess: () => void) {
    const { data: buyNoHash, writeContract: buyNo } = useWriteBinaryLmsrMarketManagerBuyNo();
    const { data: buyYesHash, writeContract: buyYes } = useWriteBinaryLmsrMarketManagerBuyYes();

    const { isLoading } = useTransactionAwait(side === "yes" ? buyYesHash : buyNoHash, {
        title: `Buy ${side}`,
        type: TransactionType.SWAP,
        callback: onSuccess,
    });

    const buy = (shares: bigint, maxTotalCost: bigint) => {
        if (side === "no") {
            buyNo({ args: [BigInt(market.id.split("-")[1]), shares, maxTotalCost] });
        } else {
            buyYes({ args: [BigInt(market.id.split("-")[1]), shares, maxTotalCost] });
        }
    };

    return { buy, isLoading };
}
