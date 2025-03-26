import { Address, formatUnits } from "viem";
import { ExtendedVault, useALMVaultsByPool } from "./useALMVaults";
import useSWR from "swr";
import { useEthersSigner } from "../common/useEthersProvider";
import { getTotalAmounts, getTotalSupply,  getUserBalance, SupportedDex } from "@cryptoalgebra/alm-sdk";

export interface UserALMVault {
    amount0: string;
    amount1: string;
    amountsUsd: number;
    shares: string;
    vault: ExtendedVault;
}

export function useUserALMVaultsByPool(poolAddress: Address | undefined, account: Address | undefined) {
    const provider = useEthersSigner();
    const { vaults, isLoading: isVaultsLoading } = useALMVaultsByPool(poolAddress);

    const currencyAPriceUSD = 1900;
    const currencyBPriceUSD = 1;

    const { data: userVaults, isLoading} = useSWR(["userVaults", account, vaults, poolAddress], async (): Promise<UserALMVault[]> => {
        if (!provider || !account || !vaults) {
            throw new Error("not ready");
        }

        const userALMVaults: UserALMVault[] = [];
        const dex = SupportedDex.CLAMM;

        for (const vault of vaults) {
            const [totalAmounts, totalSupply, shares] = await Promise.all([
                getTotalAmounts(vault.id, provider, dex, true, vault.token0.decimals, vault.token1.decimals),getTotalSupply(vault.id, provider, dex), getUserBalance(account, vault.id, provider, dex)
            ])

            const amounts = [Number(shares) * Number((totalAmounts[0].toBigInt())) / Number(totalSupply), Number(shares) * Number((totalAmounts[1].toBigInt())) / Number(totalSupply)]
            
            const formattedAmounts = [formatUnits(BigInt(amounts[0].toFixed(0)), vault.token0.decimals), formatUnits(BigInt(amounts[1].toFixed(0)), vault.token1.decimals)]

            userALMVaults.push({
                amount0: formattedAmounts[0],
                amount1: formattedAmounts[1],
                shares,
                amountsUsd: Number(formattedAmounts[0]) * currencyAPriceUSD + Number(formattedAmounts[1]) * currencyBPriceUSD,
                vault: vault,
            });
        }

        return userALMVaults;
    }, {
        revalidateOnMount: true,
        revalidateOnFocus: true,
        refreshInterval: 15_000,
    });


    return { userVaults, isLoading: isLoading || isVaultsLoading };
}
