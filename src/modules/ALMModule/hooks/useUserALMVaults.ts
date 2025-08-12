import { Address, formatUnits } from "viem";
import { ExtendedVault, useALMVaultsByPool } from "./useALMVaults";
import useSWR from "swr";
import { calculateUserDepositTokenPNL, getUserAmounts } from "@cryptoalgebra/alm-sdk";
import { useEthersSigner } from "@/hooks/common/useEthersProvider";
import { useUSDCPrice } from "@/hooks/common/useUSDCValue";

export interface UserALMVault {
    amount0: string;
    amount1: string;
    amountsUsd: number;
    shares: string;
    pnl: string;
    roi: number;
    vault: ExtendedVault;
}

export function useUserALMVaultsByPool(poolAddress: Address | undefined, account: Address | undefined) {
    const provider = useEthersSigner();
    const { vaults, isLoading: isVaultsLoading } = useALMVaultsByPool(poolAddress);

    const { formatted: currencyAPriceUSD } = useUSDCPrice(vaults?.[0]?.token0);
    const { formatted: currencyBPriceUSD } = useUSDCPrice(vaults?.[0]?.token1);
    const {
        data: userVaults,
        isLoading,
        mutate,
    } = useSWR(
        ["userVaults", account, vaults, poolAddress, currencyAPriceUSD, currencyBPriceUSD],
        async (): Promise<UserALMVault[]> => {
            if (!provider || !account || !vaults) {
                throw new Error("not ready");
            }

            const userALMVaults: UserALMVault[] = [];

            for (const vault of vaults) {
                const [userAmount0, userAmount1, shares] = await getUserAmounts(
                    account,
                    vault.id,
                    provider,
                    vault.token0.decimals,
                    vault.token1.decimals,
                    true
                );

                if (shares.toString() === "0") continue;

                const formattedUserAmounts = [
                    formatUnits(userAmount0.toBigInt(), vault.token0.decimals),
                    formatUnits(userAmount1.toBigInt(), vault.token1.decimals),
                ];

                const formattedShares = formatUnits(shares.toBigInt(), 18);

                const { pnl, roi } = await calculateUserDepositTokenPNL(
                    account,
                    vault.id,
                    userAmount0.toString(),
                    userAmount1.toString(),
                    vault.token0.decimals,
                    vault.token1.decimals,
                    provider
                );

                userALMVaults.push({
                    amount0: formattedUserAmounts[0],
                    amount1: formattedUserAmounts[1],
                    shares: formattedShares,
                    amountsUsd: Number(formattedUserAmounts[0]) * currencyAPriceUSD + Number(formattedUserAmounts[1]) * currencyBPriceUSD,
                    vault: vault,
                    pnl,
                    roi,
                });
            }

            return userALMVaults;
        },
        {
            revalidateOnMount: true,
            revalidateOnFocus: true,
            refreshInterval: 15_000,
        }
    );

    return { userVaults, isLoading: isLoading || isVaultsLoading, refetch: mutate };
}
