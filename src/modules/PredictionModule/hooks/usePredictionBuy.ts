import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { PredictionMarket } from "../types";
import { useWriteBinaryLmsrMarketManagerBuyNo, useWriteBinaryLmsrMarketManagerBuyYes } from "@/generated";

export function usePredictionBuy(market: PredictionMarket, side: "yes" | "no", onSuccess: () => void) {
    const { data: buyNoHash, writeContract: buyNo } = useWriteBinaryLmsrMarketManagerBuyNo();
    const { data: buyYesHash, writeContract: buyYes } = useWriteBinaryLmsrMarketManagerBuyYes();

    const { isLoading: isBuyYesLoading } = useTransactionAwait(buyYesHash, {
        title: `Buy YES`,
        type: TransactionType.SWAP,
        callback: onSuccess,
    });

    const { isLoading: isBuyNoLoading } = useTransactionAwait(buyNoHash, {
        title: `Buy NO`,
        type: TransactionType.SWAP,
        callback: onSuccess,
    });

    const buy = (shares: bigint, maxTotalCost: bigint) => {
        if (side === "no") {
            buyNo({ args: [market.index, shares, maxTotalCost] });
        } else {
            buyYes({ args: [market.index, shares, maxTotalCost] });
        }
    };

    return { buy, isLoading: isBuyYesLoading || isBuyNoLoading };
}
