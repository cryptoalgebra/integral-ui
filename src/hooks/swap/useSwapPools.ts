import { ADDRESS_ZERO, Currency, Pool, computeCustomPoolAddress, computePoolAddress } from "@cryptoalgebra/custom-pools-sdk";
import { useMemo } from "react";
import { useAllCurrencyCombinations } from "./useAllCurrencyCombinations";
import { useChainId } from "wagmi";
import { useMultiplePoolsQuery } from "@/graphql/generated/graphql";
import { useClients } from "../graphql/useClients";
import { CUSTOM_POOL_DEPLOYER_ADDRESSES } from "config/custom-pool-deployer";
import useSWR from "swr";
import { tryCreateBoostedToken } from "@/utils/token/tryCreateBoostedToken";
import { isDefined } from "@/utils";

/**
 * Returns all the existing pools that should be considered for swapping between an input currency and an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useSwapPools(
    currencyIn?: Currency,
    currencyOut?: Currency
): {
    pools: Pool[];
    isLoading: boolean;
} {
    const chainId = useChainId();

    const allCurrencyCombinations = useAllCurrencyCombinations(currencyIn, currencyOut);

    const { infoClient } = useClients();

    const poolsAddresses = useMemo(() => {
        const customPoolDeployerAddresses = Object.values(CUSTOM_POOL_DEPLOYER_ADDRESSES)
            .map((p) => p[chainId])
            .filter((p) => p !== ADDRESS_ZERO);

        const basePoolAddresses = allCurrencyCombinations.map(([tokenA, tokenB]) => computePoolAddress({ tokenA, tokenB }));

        const customPoolAddresses = allCurrencyCombinations.flatMap(([tokenA, tokenB]) =>
            customPoolDeployerAddresses.map((customPoolDeployer) =>
                computeCustomPoolAddress({
                    tokenA,
                    tokenB,
                    customPoolDeployer,
                })
            )
        );

        return [...basePoolAddresses, ...customPoolAddresses];
    }, [allCurrencyCombinations, chainId]);

    const { data: poolsData } = useMultiplePoolsQuery({
        client: infoClient,
        variables: {
            poolIds: poolsAddresses.map((address) => address.toLowerCase()),
        },
    });

    const { data: pools, isLoading } = useSWR(["swapPools", poolsData], () => {
        if (!poolsData?.pools) return;

        return poolsData.pools
            .map((pool) => {
                if (pool.liquidity === "0") return null;

                const token0 = tryCreateBoostedToken(
                    chainId,
                    pool.token0.id,
                    Number(pool.token0.decimals),
                    pool.token0.symbol,
                    pool.token0.name
                );
                const token1 = tryCreateBoostedToken(
                    chainId,
                    pool.token1.id,
                    Number(pool.token1.decimals),
                    pool.token1.symbol,
                    pool.token1.name
                );

                return new Pool(
                    token0,
                    token1,
                    Number(pool.fee),
                    pool.sqrtPrice,
                    pool.deployer,
                    pool.liquidity,
                    Number(pool.tick),
                    Number(pool.tickSpacing)
                );
            })
            .filter(isDefined);
    });

    return {
        pools: pools || [],
        isLoading,
    };
}
