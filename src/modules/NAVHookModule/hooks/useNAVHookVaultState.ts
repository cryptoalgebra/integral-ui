import { priceConvergenceVaultAbi } from "@/generated";
import { Address } from "viem";
import { useReadContracts } from "wagmi";
import { NAVHookVaultState } from "../types";
import { getProportionalAmount } from "../utils";
import { useNAVHookPool } from "./useNAVHookPool";

export function useNAVHookVaultState(poolId: Address | undefined, account: Address | undefined): NAVHookVaultState {
    const { vaultAddress } = useNAVHookPool(poolId);

    const {
        data: vaultData,
        isLoading: isVaultDataLoading,
        refetch: refetchVaultData,
    } = useReadContracts({
        allowFailure: false,
        contracts: vaultAddress
            ? [
                  { address: vaultAddress, abi: priceConvergenceVaultAbi, functionName: "totalSupply" },
                  { address: vaultAddress, abi: priceConvergenceVaultAbi, functionName: "getTotalAmounts" },
                  { address: vaultAddress, abi: priceConvergenceVaultAbi, functionName: "decimals" },
              ]
            : [],
        query: {
            enabled: Boolean(vaultAddress),
            refetchInterval: 15_000,
        },
    });

    const {
        data: userData,
        isLoading: isUserDataLoading,
        refetch: refetchUserData,
    } = useReadContracts({
        allowFailure: false,
        contracts:
            vaultAddress && account
                ? [{ address: vaultAddress, abi: priceConvergenceVaultAbi, functionName: "balanceOf", args: [account] }]
                : [],
        query: {
            enabled: Boolean(vaultAddress && account),
            refetchInterval: 15_000,
        },
    });

    const totalSupply = vaultData?.[0] ?? 0n;
    const totalAmounts = vaultData?.[1] ?? [0n, 0n];
    const shareDecimals = vaultData?.[2] ?? 18;
    const userShares = userData?.[0] ?? 0n;
    const total0 = totalAmounts[0] ?? 0n;
    const total1 = totalAmounts[1] ?? 0n;
    const userAmount0 = getProportionalAmount(total0, userShares, totalSupply);
    const userAmount1 = getProportionalAmount(total1, userShares, totalSupply);

    return {
        userShares,
        totalSupply,
        total0,
        total1,
        userAmount0,
        userAmount1,
        shareDecimals: Number(shareDecimals),
        isLoading: isVaultDataLoading || isUserDataLoading,
        hasPosition: userShares > 0n,
        refetch: () => {
            refetchVaultData();
            refetchUserData();
        },
    };
}
