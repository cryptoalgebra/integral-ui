import { getVaultsByPool, AlgebraVault, getExtendedAlgebraVault, getAllVaults } from "@cryptoalgebra/alm-sdk";
import useSWR from "swr";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import { Address, formatUnits } from "viem";
import { useChainId } from "wagmi";
import { useReadAlgebraPoolToken0, useReadAlgebraPoolToken1 } from "@/generated";
import { useEthersProvider } from "@/hooks/common/useEthersProvider";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useUSDCPrice } from "@/hooks/common/useUSDCValue";

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

export function useAllALMVaults() {
    const chainId = useChainId();

    return useSWR(["allALMVaults", chainId], () => getAllVaults(chainId));
}

export function useALMVaultsByPool(
    poolAddress: Address | undefined
): {
    vaults: ExtendedVault[] | undefined;
    isLoading: boolean;
} {
    const { data: token0Address } = useReadAlgebraPoolToken0({
        address: poolAddress,
    });
    const { data: token1Address } = useReadAlgebraPoolToken1({
        address: poolAddress,
    });

    const chainId = useChainId();

    const currencyA = useCurrency(token0Address, true);
    const currencyB = useCurrency(token1Address, true);

    const provider = useEthersProvider();

    const { formatted: currencyAPriceUSD, price: currencyAPrice } = useUSDCPrice(currencyA);
    const { formatted: currencyBPriceUSD, price: currencyBPrice } = useUSDCPrice(currencyB);

    const { data: vaultAddresses } = useSWR(["vaultAddresses", poolAddress], async () => {
        if (!poolAddress) {
            throw new Error("No pool address");
        }
        const vaultAddresses: string[] = await getVaultsByPool(poolAddress, chainId);
        return vaultAddresses;
    });

    const isReady = vaultAddresses && currencyA && currencyB && poolAddress && currencyAPrice && currencyBPrice && provider;

    const { data: vaults, isLoading } = useSWR(["almVaults", isReady], async () => {
        if (!isReady) {
            throw new Error("not ready");
        }

        const vaultsData = await Promise.all(
            vaultAddresses.map(async (vault) => {
                const data = await getExtendedAlgebraVault(vault, chainId, provider, currencyA.decimals, currencyB.decimals);

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
    });

    return { vaults, isLoading };
}
