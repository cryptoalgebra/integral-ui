import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useUserState } from "@/state/userStore";
import { Percent, Position } from "@cryptoalgebra/custom-pools-sdk";
import { OmegaRouter } from "@cryptoalgebra/omega-router-sdk";
import { OMEGA_ROUTER } from "config/contract-addresses";
import { useCallback, useMemo } from "react";
import { Address } from "viem";
import { useAccount, useChainId, useSendTransaction } from "wagmi";
import { NFTPermitState, useNFTPermit } from "./useNFTPermit";

interface UseOmegaBurnCallbackParams {
    positionId: number;
    positionSDK?: Position;
    liquidityPercentage?: Percent;
    token0Unwrap: boolean;
    token1Unwrap: boolean;
    token0Address?: Address;
    token1Address?: Address;
    percent: number;
}

export const useOmegaBurnCallback = ({
    positionId,
    positionSDK,
    liquidityPercentage,
    token0Unwrap,
    token1Unwrap,
    token0Address,
    token1Address,
    percent,
}: UseOmegaBurnCallbackParams) => {
    const { txDeadline } = useUserState();
    const { address: account } = useAccount();
    const chainId = useChainId();

    // NFT Permit for OmegaRouter
    const { permitState, permitCallback, permitSignature, isLoading: isPermitLoading } = useNFTPermit({
        tokenId: positionId,
        spender: chainId ? OMEGA_ROUTER[chainId] : undefined,
    });

    const needsPermit = permitState === NFTPermitState.NOT_PERMITTED;

    const { calldata, value } = useMemo(() => {
        if (!positionSDK || !positionId || !liquidityPercentage || !account || percent === 0 || !permitSignature)
            return { calldata: undefined, value: undefined };

        try {
            return OmegaRouter.removeCallParameters(positionSDK, {
                tokenId: positionId,
                liquidityPercentage,
                slippageTolerance: new Percent(1, 100),
                deadline: Date.now() + txDeadline * 1000,
                burnToken: liquidityPercentage.equalTo(new Percent(1)),
                token0Unwrap,
                token1Unwrap,
                permit: permitSignature,
                recipient: account,
            });
        } catch (error) {
            console.error(error);
            return { calldata: undefined, value: undefined };
        }
    }, [positionId, positionSDK, txDeadline, liquidityPercentage, account, percent, token0Unwrap, token1Unwrap, permitSignature]);

    const removeLiquidityConfig = useMemo(() => {
        if (!calldata) return undefined;

        return {
            to: OMEGA_ROUTER[chainId],
            data: calldata as Address,
            value: BigInt(value || 0),
        };
    }, [calldata, value, chainId]);

    const { data: removeLiquidityData, sendTransactionAsync: removeLiquidity, isPending } = useSendTransaction();

    const { isLoading: isRemoveLoading, isSuccess } = useTransactionAwait(removeLiquidityData, {
        title: "Remove liquidity",
        tokenA: token0Address as Address,
        tokenB: token1Address as Address,
        type: TransactionType.POOL,
    });

    const burnCallback = useCallback(async () => {
        if (needsPermit) {
            await permitCallback();
            return;
        }

        if (!removeLiquidityConfig) return;

        return removeLiquidity(removeLiquidityConfig);
    }, [removeLiquidityConfig, needsPermit, permitCallback, removeLiquidity]);

    return {
        burnCallback,
        isLoading: isRemoveLoading,
        isPending,
        isPermitLoading,
        isSuccess,
        needsPermit,
        config: removeLiquidityConfig,
    };
};
