import { Address, formatUnits } from "viem";
import { ExtendedVault, useALMVaultsByPool } from "./useALMVaults";
import useSWR from "swr";
import { calculateUserDepositTokenPNL, getUserAmounts, getUserAmountsStaked } from "@cryptoalgebra/alm-sdk";
import { useEthersProvider } from "@/hooks/common/useEthersProvider";
import { useUSDCPrice } from "@/hooks/common/useUSDCValue";

export interface UserALMVault {
    amount0: string;
    amount1: string;
    amountsUsd: number;
    shares: string;
    pnl: string;
    roi: number;
    onFarming: boolean;
    vault: ExtendedVault;
}

export function useUserALMVaultsByPool(poolAddress: Address | undefined, account: Address | undefined) {
    const provider = useEthersProvider();
    const { vaults, isLoading: isVaultsLoading } = useALMVaultsByPool(poolAddress);

    const { formatted: currencyAPriceUSD } = useUSDCPrice(vaults?.[0]?.token0);
    const { formatted: currencyBPriceUSD } = useUSDCPrice(vaults?.[0]?.token1);
    const { data: userVaults, isLoading, mutate } = useSWR(
        ["userVaults", account, vaults, poolAddress, currencyAPriceUSD, currencyBPriceUSD, provider],
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
                    onFarming: false,
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

    const { data: stakedUserVaults, isLoading: isStakedUserVaultsLoading, mutate: mutateStaked } = useSWR(
        ["stakedUserVaults", account, vaults, poolAddress, currencyAPriceUSD, currencyBPriceUSD, provider],
        async (): Promise<UserALMVault[]> => {
            if (!provider || !account || !vaults) {
                throw new Error("not ready");
            }

            const userALMVaults: UserALMVault[] = [];

            for (const vault of vaults) {
                const [userAmount0Staked, userAmount1Staked, sharesStaked] = await getUserAmountsStaked(
                    account,
                    vault.id,
                    provider,
                    vault.token0.decimals,
                    vault.token1.decimals,
                    true
                );

                if (sharesStaked.toString() === "0") continue;

                const formattedUserAmountsStaked = [
                    formatUnits(userAmount0Staked.toBigInt(), vault.token0.decimals),
                    formatUnits(userAmount1Staked.toBigInt(), vault.token1.decimals),
                ];
                const formattedStakedShares = formatUnits(sharesStaked.toBigInt(), 18);

                const { pnl, roi } = await calculateUserDepositTokenPNL(
                    account,
                    vault.id,
                    userAmount0Staked.toString(),
                    userAmount1Staked.toString(),
                    vault.token0.decimals,
                    vault.token1.decimals,
                    provider
                );

                userALMVaults.push({
                    amount0: formatUnits(userAmount0Staked.toBigInt(), vault.token0.decimals),
                    amount1: formatUnits(userAmount1Staked.toBigInt(), vault.token1.decimals),
                    shares: formattedStakedShares,
                    amountsUsd:
                        Number(formattedUserAmountsStaked[0]) * currencyAPriceUSD +
                        Number(formattedUserAmountsStaked[1]) * currencyBPriceUSD,
                    vault: vault,
                    pnl,
                    roi,
                    onFarming: true,
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

    return {
        userVaults: userVaults?.concat(stakedUserVaults || []),
        isLoading: isLoading || isVaultsLoading || isStakedUserVaultsLoading,
        refetch: () => {
            mutate();
            mutateStaked();
        },
    };
}
