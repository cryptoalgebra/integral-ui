import { useWriteNonfungiblePositionManagerMulticall } from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Currency, CurrencyAmount, NonfungiblePositionManager } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";

interface UseCollectCallbackParams {
    positionId: number;
    amount0?: CurrencyAmount<Currency>;
    amount1?: CurrencyAmount<Currency>;
    token0Address?: Address;
    token1Address?: Address;
}

export const useCollectCallback = ({
    positionId,
    amount0,
    amount1,
    token0Address,
    token1Address,
}: UseCollectCallbackParams) => {
    const { address: account } = useAccount();

    const { calldata, value } = useMemo(() => {
        if (!account || !amount0 || !amount1) return { calldata: undefined, value: undefined };

        return NonfungiblePositionManager.collectCallParameters({
            tokenId: positionId.toString(),
            expectedCurrencyOwed0: amount0,
            expectedCurrencyOwed1: amount1,
            recipient: account,
        });
    }, [positionId, amount0, amount1, account]);

    const collectConfig = calldata
        ? {
              args: [calldata as `0x${string}`[]] as const,
              value: BigInt(value || 0),
          }
        : undefined;

    const { data: collectData, writeContract: collect, isPending } = useWriteNonfungiblePositionManagerMulticall();

    const { isLoading } = useTransactionAwait(collectData, {
        title: "Collect fees",
        tokenA: token0Address as Address,
        tokenB: token1Address as Address,
        type: TransactionType.POOL,
    });

    const collectCallback = async () => {
        if (!collectConfig || !collect) return;
        return collect(collectConfig);
    };

    return {
        collectCallback,
        isLoading,
        isPending,
        config: collectConfig,
    };
};
