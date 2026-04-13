import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useWriteBinaryLmsrMarketManagerRedeem } from "@/generated";
import { PredictionMarket } from "../types";

export function usePredictionRedeem(market: PredictionMarket, onSuccess: () => void) {
    const { data: redeemHash, writeContract: redeem } = useWriteBinaryLmsrMarketManagerRedeem();

    const { isLoading } = useTransactionAwait(redeemHash, {
        title: "Redeem",
        type: TransactionType.SWAP,
        callback: onSuccess,
    });

    const handleRedeem = () => {
        redeem({
            args: [market.index],
        });
    };

    return { redeem: handleRedeem, isLoading };
}
