import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { parseUnits } from "viem";
import { PredictionMarket } from "../types";
import {
    useSimulateBinaryLmsrMarketManagerSellNo,
    useSimulateBinaryLmsrMarketManagerSellYes,
    useWriteBinaryLmsrMarketManagerSellNo,
    useWriteBinaryLmsrMarketManagerSellYes,
} from "@/generated";

export function usePredictionSell(market: PredictionMarket | undefined, amountToSell: string, side: "yes" | "no", onSuccess: () => void) {
    const parsedAmount = amountToSell ? parseUnits(amountToSell, 6) : undefined;

    const { data: sellYesAmount, isLoading: isSellYesSimulating } = useSimulateBinaryLmsrMarketManagerSellYes({
        args: market && parsedAmount && side === "yes" ? [market.index, parsedAmount, 0n] : undefined,
        query: { enabled: side === "yes" && !!parsedAmount },
    });

    const { data: sellNoAmount, isLoading: isSellNoSimulating } = useSimulateBinaryLmsrMarketManagerSellNo({
        args: market && parsedAmount && side === "no" ? [market.index, parsedAmount, 0n] : undefined,
        query: { enabled: side === "no" && !!parsedAmount },
    });

    const { data: sellYesHash, writeContract: sellYes } = useWriteBinaryLmsrMarketManagerSellYes();
    const { data: sellNoHash, writeContract: sellNo } = useWriteBinaryLmsrMarketManagerSellNo();

    const { isLoading: isSellYesLoading } = useTransactionAwait(sellYesHash, {
        title: `Sell YES`,
        type: TransactionType.SWAP,
        callback: onSuccess,
    });
    const { isLoading: isSellNoLoading } = useTransactionAwait(sellNoHash, {
        title: `Sell NO`,
        type: TransactionType.SWAP,
        callback: onSuccess,
    });

    const simulationResult = side === "yes" ? sellYesAmount?.result : sellNoAmount?.result;
    const isSimulating = side === "yes" ? isSellYesSimulating : isSellNoSimulating;

    const sell = () => {
        if (!parsedAmount || !simulationResult || !market) return;

        if (side === "no") {
            sellNo({ args: [market.index, parsedAmount, simulationResult] });
        } else {
            sellYes({ args: [market.index, parsedAmount, simulationResult] });
        }
    };

    return { sell, isLoading: isSellYesLoading || isSellNoLoading, isSimulating, simulationResult };
}
