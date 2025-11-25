import { useWriteNonfungiblePositionManagerMulticall } from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useUserState } from "@/state/userStore";
import { CurrencyAmount, NonfungiblePositionManager, Percent, Position } from "@cryptoalgebra/custom-pools-sdk";
import { NONFUNGIBLE_POSITION_MANAGER } from "config/contract-addresses";
import { useMemo } from "react";
import { Address } from "viem";
import { useAccount, useChainId } from "wagmi";

interface UseBurnCallbackParams {
    positionId: number;
    positionSDK?: Position;
    liquidityPercentage?: Percent;
    feeValue0?: CurrencyAmount<any>;
    feeValue1?: CurrencyAmount<any>;
    token0Address?: Address;
    token1Address?: Address;
    percent: number;
}

export const useBurnCallback = ({
    positionId,
    positionSDK,
    liquidityPercentage,
    feeValue0,
    feeValue1,
    token0Address,
    token1Address,
    percent,
}: UseBurnCallbackParams) => {
    const { txDeadline } = useUserState();
    const { address: account } = useAccount();
    const chainId = useChainId();

    const { calldata, value } = useMemo(() => {
        if (!positionSDK || !positionId || !liquidityPercentage || !feeValue0 || !feeValue1 || !account || percent === 0)
            return { calldata: undefined, value: undefined };

        return NonfungiblePositionManager.removeCallParameters(positionSDK, {
            tokenId: String(positionId),
            liquidityPercentage,
            slippageTolerance: new Percent(1, 100),
            deadline: Date.now() + txDeadline * 1000,
            collectOptions: {
                expectedCurrencyOwed0: feeValue0,
                expectedCurrencyOwed1: feeValue1,
                recipient: account,
            },
        });
    }, [positionId, positionSDK, txDeadline, feeValue0, feeValue1, liquidityPercentage, account, percent]);

    const removeLiquidityConfig = calldata
        ? {
              address: NONFUNGIBLE_POSITION_MANAGER[chainId],
              args: [calldata as `0x${string}`[]] as const,
              value: BigInt(value || 0),
          }
        : undefined;

    const { data: removeLiquidityData, writeContract: removeLiquidity, isPending } = useWriteNonfungiblePositionManagerMulticall();

    const { isLoading: isRemoveLoading, isSuccess } = useTransactionAwait(removeLiquidityData, {
        title: "Remove liquidity",
        tokenA: token0Address as Address,
        tokenB: token1Address as Address,
        type: TransactionType.POOL,
    });

    const burnCallback = async () => {
        if (!removeLiquidityConfig || !removeLiquidity) return;
        return removeLiquidity(removeLiquidityConfig);
    };

    return {
        burnCallback,
        isLoading: isRemoveLoading,
        isPending,
        isSuccess,
        config: removeLiquidityConfig,
    };
};
