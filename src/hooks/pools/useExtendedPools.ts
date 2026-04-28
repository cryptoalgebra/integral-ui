import { useChainId } from "wagmi";
import { useClients } from "../graphql/useClients";
import { usePoolsListQuery } from "@/graphql/generated/graphql";
import { fetcher, POOL_AVG_APR_API } from "config/apr-urls";
import { useMemo } from "react";
import useSWR from "swr";
import { Address } from "viem";
import { useNativePriceUSD } from "../common/useNativePriceUSD";
import { Pool } from "@cryptoalgebra/integral-sdk";
import { getCurrency } from "../common/useCurrency";

export interface ExtendedPool {
    id: Address;
    pool: Pool;
    tvlUSD: number;
    volume24USD: number;
    fees24USD: number;
    token0PriceUSD: number;
    token1PriceUSD: number;
    apr: number;
}

export function useExtendedPools(tokenAddress?: Address): { pools: ExtendedPool[]; isLoading: boolean } {
    const chainId = useChainId();

    const { infoClient } = useClients();

    const { nativePriceUSD, isLoading: isNativePriceLoading } = useNativePriceUSD();

    const { data: pools, loading: isPoolsListLoading } = usePoolsListQuery({
        client: infoClient,
    });

    const { data: poolsAvgApr, isLoading: isPoolsAvgAprLoading } = useSWR(POOL_AVG_APR_API, fetcher);

    const isLoading = isPoolsListLoading || isPoolsAvgAprLoading || isNativePriceLoading;

    const formattedPools: ExtendedPool[] = useMemo(() => {
        if (isLoading || !pools) return [];

        return pools.pools
            .filter((pool) => {
                if (tokenAddress) {
                    return (
                        pool.token0.id.toLowerCase() === tokenAddress.toLowerCase() ||
                        pool.token1.id.toLowerCase() === tokenAddress.toLowerCase()
                    );
                }
                return true;
            })
            .map(
                ({
                    id,
                    token0: _token0,
                    token1: _token1,
                    overrideFee,
                    sqrtPrice,
                    liquidity,
                    tick,
                    tickSpacing,
                    totalValueLockedUSD,
                    deployer,
                    poolDayData,
                }) => {
                    const token0 = getCurrency(chainId, _token0.id, Number(_token0.decimals), _token0.symbol, _token0.name);
                    const token1 = getCurrency(chainId, _token1.id, Number(_token1.decimals), _token1.symbol, _token1.name);
                    const pool = new Pool(
                        token0.wrapped,
                        token1.wrapped,
                        Number(overrideFee),
                        sqrtPrice,
                        deployer,
                        liquidity,
                        Number(tick),
                        Number(tickSpacing),
                    );

                    const currentPool = poolDayData[0];
                    const lastDate = currentPool ? currentPool.date * 1000 : 0;
                    const currentDate = new Date().getTime();

                    /* time difference calculations here to ensure that the graph provides information for the last 24 hours */
                    const timeDifference = currentDate - lastDate;
                    const msIn24Hours = 24 * 60 * 60 * 1000;

                    const tvlUSD = Number(totalValueLockedUSD);
                    const volume24USD = timeDifference <= msIn24Hours ? Number(currentPool.volumeUSD) : 0;
                    const fees24USD = timeDifference <= msIn24Hours ? Number(currentPool.feesUSD) : 0;

                    const token0PriceUSD = Number(_token0.derivedMatic || 0) * nativePriceUSD;
                    const token1PriceUSD = Number(_token1.derivedMatic || 0) * nativePriceUSD;

                    const apr = poolsAvgApr && poolsAvgApr[id] ? Number(poolsAvgApr[id].toFixed(2)) : 0;

                    return {
                        id: id as Address,
                        pool,
                        tvlUSD,
                        volume24USD,
                        fees24USD,
                        token0PriceUSD,
                        token1PriceUSD,
                        apr,
                    };
                },
            );
    }, [isLoading, pools, tokenAddress, poolsAvgApr, chainId, nativePriceUSD]);

    return { pools: formattedPools, isLoading };
}
