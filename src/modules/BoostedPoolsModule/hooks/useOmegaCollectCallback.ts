import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Currency, CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import { OmegaRouter } from "@cryptoalgebra/omega-router-sdk";
import { OMEGA_ROUTER } from "config/contract-addresses";
import { useCallback, useMemo } from "react";
import { Address } from "viem";
import { useAccount, useChainId, useSendTransaction } from "wagmi";
import { NFTPermitState, useNFTPermit } from "./useNFTPermit";

interface UseOmegaCollectCallbackParams {
    positionId: number;
    amount0?: CurrencyAmount<Currency>;
    amount1?: CurrencyAmount<Currency>;
    token0Unwrap: boolean;
    token1Unwrap: boolean;
    token0Address?: Address;
    token1Address?: Address;
}

export const useOmegaCollectCallback = ({
    positionId,
    amount0,
    amount1,
    token0Unwrap,
    token1Unwrap,
    token0Address,
    token1Address,
}: UseOmegaCollectCallbackParams) => {
    const { address: account } = useAccount();
    const chainId = useChainId();

    // NFT Permit for OmegaRouter
    const { permitState, permitCallback, permitSignature, isLoading: isPermitLoading } = useNFTPermit({
        tokenId: positionId,
        spender: chainId ? OMEGA_ROUTER[chainId] : undefined,
    });

    const needsPermit = permitState === NFTPermitState.NOT_PERMITTED;

    const { calldata, value } = useMemo(() => {
        const token0 = amount0?.currency;
        const token1 = amount1?.currency;

        if (!account || !amount0 || !amount1 || !permitSignature || !token0 || !token1) {
            return { calldata: undefined, value: undefined };
        }

        try {
            return OmegaRouter.collectCallParameters(token0.wrapped, token1.wrapped, {
                tokenId: positionId,
                recipient: account,
                token0Unwrap,
                token1Unwrap,
                permit: permitSignature,
            });
        } catch (error) {
            console.error(error);
            return { calldata: undefined, value: undefined };
        }
    }, [account, amount0, amount1, permitSignature, positionId, token0Unwrap, token1Unwrap]);

    const collectConfig = useMemo(() => {
        if (!calldata) return undefined;

        return {
            to: OMEGA_ROUTER[chainId],
            data: calldata as Address,
            value: BigInt(value || 0),
        };
    }, [calldata, value, chainId]);

    const { data: collectData, sendTransactionAsync: collect, isPending } = useSendTransaction();

    const { isLoading } = useTransactionAwait(collectData, {
        title: "Collect fees",
        tokenA: token0Address as Address,
        tokenB: token1Address as Address,
        type: TransactionType.POOL,
    });

    const collectCallback = useCallback(async () => {
        if (needsPermit) {
            await permitCallback();
            return;
        }

        if (!collectConfig) return;

        return collect(collectConfig);
    }, [collectConfig, needsPermit, permitCallback, collect]);

    return {
        collectCallback,
        isLoading,
        isPending,
        isPermitLoading,
        needsPermit,
        config: collectConfig,
    };
};
