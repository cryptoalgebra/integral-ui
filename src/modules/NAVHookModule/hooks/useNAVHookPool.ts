import { useCurrency } from "@/hooks/common/useCurrency";
import { priceConvergenceVaultAbi } from "@/generated";
import { PRICE_CONVERGENCE_VAULT_BY_POOL, PRICE_CONVERGENCE_VAULT_DEPOSIT_GUARD_BY_POOL } from "config";
import { useMemo } from "react";
import { Address } from "viem";
import { useChainId, useReadContract } from "wagmi";
import { NAVHookPoolInfo } from "../types";
import { getAddressByPool } from "../utils";

export function useNAVHookPool(poolId: Address | undefined): NAVHookPoolInfo {
    const chainId = useChainId();

    const vaultAddress = useMemo(
        () => getAddressByPool(PRICE_CONVERGENCE_VAULT_BY_POOL[chainId], poolId),
        [chainId, poolId],
    );
    const guardAddress = useMemo(
        () => getAddressByPool(PRICE_CONVERGENCE_VAULT_DEPOSIT_GUARD_BY_POOL[chainId], poolId),
        [chainId, poolId],
    );

    const { data: token0Address } = useReadContract({
        address: vaultAddress,
        abi: priceConvergenceVaultAbi,
        functionName: "token0",
        query: {
            enabled: Boolean(vaultAddress),
        },
    });

    const { data: token1Address } = useReadContract({
        address: vaultAddress,
        abi: priceConvergenceVaultAbi,
        functionName: "token1",
        query: {
            enabled: Boolean(vaultAddress),
        },
    });

    const token0 = useCurrency(token0Address, true);
    const token1 = useCurrency(token1Address, true);

    return {
        isNAVHookPool: Boolean(vaultAddress && guardAddress),
        vaultAddress,
        guardAddress,
        token0,
        token1,
    };
}
