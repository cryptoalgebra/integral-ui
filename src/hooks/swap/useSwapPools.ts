import { Currency, Token, computeCustomPoolAddress, computePoolAddress } from "@cryptoalgebra/custom-pools-sdk";
import { useEffect, useMemo, useState } from "react";
import { useAllCurrencyCombinations } from "./useAllCurrencyCombinations";
import { Address, useChainId } from "wagmi";
import { TokenFieldsFragment, useMultiplePoolsLazyQuery } from "@/graphql/generated/graphql";
import { useClients } from "../graphql/useClients";
import { CUSTOM_POOL_BASE, CUSTOM_POOL_DEPLOYER_ALM, CUSTOM_POOL_DEPLOYER_LIMIT_ORDER } from "@/constants/addresses";

/**
 * Returns all the existing pools that should be considered for swapping between an input currency and an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useSwapPools(
    currencyIn?: Currency,
    currencyOut?: Currency,
    deployer?: Address
): {
    pools: {
        tokens: [Token, Token];
        pool: {
            address: Address;
            liquidity: string;
            price: string;
            tick: string;
            fee: string;
            deployer: string;
            token0: TokenFieldsFragment;
            token1: TokenFieldsFragment;
        };
    }[];
    loading: boolean;
} {
    const [existingPools, setExistingPools] = useState<any[]>();

    const chainId = useChainId();

    const allCurrencyCombinations = useAllCurrencyCombinations(currencyIn, currencyOut);

    const { infoClient } = useClients();

    const [getMultiplePools] = useMultiplePoolsLazyQuery({
        client: infoClient,
    });

    useEffect(() => {
        async function getPools() {
            const customPoolDeployerAddresses = [
                CUSTOM_POOL_BASE[chainId],
                CUSTOM_POOL_DEPLOYER_LIMIT_ORDER[chainId],
                CUSTOM_POOL_DEPLOYER_ALM[chainId],
            ].filter((d) => d !== undefined);

            const poolsAddresses = allCurrencyCombinations.flatMap(([tokenA, tokenB]) =>
                customPoolDeployerAddresses.map((customPoolDeployer) =>
                    customPoolDeployer === CUSTOM_POOL_BASE[chainId]
                        ? computePoolAddress({ tokenA, tokenB })
                        : computeCustomPoolAddress({
                              tokenA,
                              tokenB,
                              customPoolDeployer,
                          })
                )
            );

            const poolsData = await getMultiplePools({
                variables: {
                    poolIds: poolsAddresses.map((address) => address.toLowerCase()),
                },
            });

            // const poolsLiquidities = await Promise.allSettled(poolsAddresses.map(address => getAlgebraPool({
            //     address
            // }).read.liquidity()))

            // const poolsGlobalStates = await Promise.allSettled(poolsAddresses.map(address => getAlgebraPool({
            //     address
            // }).read.globalState()))

            const pools =
                poolsData.data &&
                poolsData.data.pools.map((pool) => ({
                    address: pool.id,
                    liquidity: pool.liquidity,
                    price: pool.sqrtPrice,
                    tick: pool.tick,
                    fee: pool.fee,
                    deployer: pool.deployer,
                    token0: pool.token0,
                    token1: pool.token1,
                }));

            setExistingPools(pools);
        }

        Boolean(allCurrencyCombinations.length) && getPools();
    }, [allCurrencyCombinations, deployer, chainId]);

    return useMemo(() => {
        if (!existingPools)
            return {
                pools: [],
                loading: true,
            };

        return {
            pools: existingPools
                .map((pool) => ({
                    tokens: [
                        new Token(chainId, pool.token0.id, Number(pool.token0.decimals), pool.token0.symbol, pool.token0.name),
                        new Token(chainId, pool.token1.id, Number(pool.token1.decimals), pool.token1.symbol, pool.token1.name),
                    ] as [Token, Token],
                    pool: pool,
                }))
                .filter(({ pool }) => {
                    return pool;
                }),
            loading: false,
        };
    }, [existingPools, deployer, chainId]);
}
