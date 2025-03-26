import { getVaultsByPool, SupportedChainId, SupportedDex, IchiVault, getExtendedIchiVaultInfo } from "@cryptoalgebra/alm-sdk";
import useSWR from "swr";
import { useEthersProvider } from "../common/useEthersProvider";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import { useAlgebraPoolToken0, useAlgebraPoolToken1 } from "@/generated";
import { useCurrency } from "../common/useCurrency";
import { Address, formatUnits } from "viem";

export interface ExtendedVault extends Omit<IchiVault, "tokenA" | "tokenB"> {
    name: string;
    apr: number;
    amount0: string;
    amount1: string;
    tvlUsd: number;
    token0: Currency;
    token1: Currency;
    depositToken: Currency;
}

export function useALMVaultsByPool(poolAddress: Address | undefined) {
    const { data: token0Address } = useAlgebraPoolToken0({
        address: poolAddress,
    });
    const { data: token1Address } = useAlgebraPoolToken1({
        address: poolAddress,
    });

    const currencyA = useCurrency(token0Address, true);
    const currencyB = useCurrency(token1Address, true);

    const provider = useEthersProvider();

    const currencyAPriceUSD = 1900;
    const currencyBPriceUSD = 1;

    const { data: vaults, isLoading } = useSWR(["vaults", poolAddress, provider, currencyA, currencyB], async () => {
        if (!provider || !currencyA || !currencyB || !poolAddress) {
            throw new Error("No provider");
        }

        const dex = SupportedDex.CLAMM;
        const chainId = SupportedChainId.base

        const vaultAddresses: string[] = await getVaultsByPool(poolAddress, SupportedChainId.base, SupportedDex.CLAMM);

    
        const vaultsData = await Promise.all(
            vaultAddresses.map(async (vault) => {
                const data = await getExtendedIchiVaultInfo(
                    vault,
                    dex,
                    chainId,
                    provider,
                    currencyA.decimals,
                    currencyB.decimals,
                );

                const amount0 = formatUnits(data.amount0, currencyA.decimals);
                const amount1 = formatUnits(data.amount1, currencyB.decimals);

                const tvlUsd = Number(amount0) * currencyAPriceUSD + Number(amount1) * currencyBPriceUSD;

                const depositToken = data.allowTokenA ? currencyA : currencyB;

                return {
                    ...data,
                    name: `ALM-${depositToken.symbol}`,
                    apr: data.apr || 0,
                    tvlUsd,
                    amount0,
                    amount1,
                    token0: currencyA,
                    token1: currencyB,
                    depositToken,
                };
            }, )
        );

        return vaultsData;
    });

    return { vaults, isLoading };
}
