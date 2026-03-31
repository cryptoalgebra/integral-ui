import { useWritePredictionMarketRedeem } from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { PredictionMarket } from "../types";

export function usePredictionRedeem(market: PredictionMarket, onSuccess: () => void) {
    const { data: redeemHash, writeContract: redeem } = useWritePredictionMarketRedeem();

    const { isLoading } = useTransactionAwait(redeemHash, {
        title: "Redeem",
        type: TransactionType.SWAP,
        callback: onSuccess,
    });

    const handleRedeem = () => {
        redeem({ address: market.id });
    };

    return { redeem: handleRedeem, isLoading };
}
