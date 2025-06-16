import { getVaultsByPool, SupportedDex, AlgebraVault, getExtendedAlgebraVault } from "@cryptoalgebra/alm-sdk";
import useSWR from "swr";
import { useEthersProvider } from "../common/useEthersProvider";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import { useAlgebraPoolToken0, useAlgebraPoolToken1 } from "@/generated";
import { useCurrency } from "../common/useCurrency";
import { Address, formatUnits } from "viem";
import { useChainId } from "wagmi";
import { useUSDCPrice } from "../common/useUSDCValue";

export interface ExtendedVault extends Omit<AlgebraVault, "tokenA" | "tokenB"> {
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

    const chainId = useChainId();

    const currencyA = useCurrency(token0Address, true);
    const currencyB = useCurrency(token1Address, true);

    const provider = useEthersProvider();

    const { formatted: currencyAPriceUSD } = useUSDCPrice(currencyA);
    const { formatted: currencyBPriceUSD } = useUSDCPrice(currencyB);

    const { data: vaults, isLoading } = useSWR(
        ["vaults", poolAddress, provider, currencyA, currencyB, chainId, currencyAPriceUSD, currencyBPriceUSD],
        async () => {
            if (!provider || !currencyA || !currencyB || !poolAddress) {
                throw new Error("No provider");
            }

            const dex = SupportedDex.CLAMM;

            const vaultAddresses: string[] = await getVaultsByPool(poolAddress, chainId, SupportedDex.CLAMM);

            const vaultsData = await Promise.all(
                vaultAddresses.map(async (vault) => {
                    const data = await getExtendedAlgebraVault(vault, dex, chainId, provider, currencyA.decimals, currencyB.decimals);

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
                })
            );

            return vaultsData;
        }
    );

    return { vaults, isLoading };
}
