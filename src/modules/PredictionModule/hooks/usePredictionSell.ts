import {
    useSimulatePredictionMarketSellNo,
    useSimulatePredictionMarketSellYes,
    useWritePredictionMarketSellNo,
    useWritePredictionMarketSellYes,
} from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { parseUnits } from "viem";
import { PredictionMarket } from "../types";

export function usePredictionSell(market: PredictionMarket, amountToSell: string, side: "yes" | "no", onSuccess: () => void) {
    const parsedAmount = amountToSell ? parseUnits(amountToSell, 6) : undefined;

    const { data: sellYesAmount, isLoading: isSellYesSimulating } = useSimulatePredictionMarketSellYes({
        address: market.id,
        args: parsedAmount && side === "yes" ? [parsedAmount, 0n] : undefined,
        query: { enabled: side === "yes" && !!parsedAmount },
    });

    const { data: sellNoAmount, isLoading: isSellNoSimulating } = useSimulatePredictionMarketSellNo({
        address: market.id,
        args: parsedAmount && side === "no" ? [parsedAmount, 0n] : undefined,
        query: { enabled: side === "no" && !!parsedAmount },
    });

    const { data: sellYesHash, writeContract: sellYes } = useWritePredictionMarketSellYes();
    const { data: sellNoHash, writeContract: sellNo } = useWritePredictionMarketSellNo();

    const { isLoading: isSellLoading } = useTransactionAwait(side === "yes" ? sellYesHash : sellNoHash, {
        title: `Sell ${side}`,
        type: TransactionType.SWAP,
        callback: onSuccess,
    });

    const simulationResult = side === "yes" ? sellYesAmount?.result : sellNoAmount?.result;
    const isSimulating = side === "yes" ? isSellYesSimulating : isSellNoSimulating;

    const sell = () => {
        if (!parsedAmount || !simulationResult) return;

        if (side === "no") {
            sellNo({ address: market.id, args: [parsedAmount, simulationResult] });
        } else {
            sellYes({ address: market.id, args: [parsedAmount, simulationResult] });
        }
    };

    return { sell, isLoading: isSellLoading, isSimulating, simulationResult };
}
