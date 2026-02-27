import { useMemo } from "react";
import { useVotingPools } from "./useVotingPools";
import { formatUnits } from "viem";
import { FormattedVotingPool, RewardToken } from "../types/voting";
import { useClients } from "@/hooks/graphql/useClients";
import { usePoolsListQuery } from "@/graphql/generated/graphql";
import { useChainId } from "wagmi";
import { useUSDCPrice } from "@/hooks/common/useUSDCValue";
import { TOKENS } from "config/tokens";

export function useFormattedVotingPools() {
    const chainId = useChainId();
    const { data: votingPools, isLoading: votingPoolsLoading, refetch: refetchVotingPools } = useVotingPools();

    const { infoClient } = useClients();

    const { data: commonPoolsResult, loading: isCommonPoolsLoading } = usePoolsListQuery({
        client: infoClient,
    });

    const commonPools = useMemo(() => commonPoolsResult?.pools ?? [], [commonPoolsResult]);

    const { formatted: tokenPriceUSD } = useUSDCPrice(TOKENS[chainId].TOKEN);

    const formattedVotingPools: FormattedVotingPool[] = useMemo(() => {
        if (votingPoolsLoading || !commonPools) {
            return [];
        }

        return votingPools
            .filter((v) => v.isAlive) // filter out inactive gauges
            .map((votingPool, index) => {
                const { totalValueLockedUSD, poolDayData } =
                    commonPools.find((commonPool) => commonPool.id.toLowerCase() === votingPool.pool.toLowerCase()) || {};

                const feesForCurrentEpoch = Number(poolDayData?.[0].feesUSD || 0);

                // const feesForCurrentEpoch =
                //     poolDayData
                //         ?.filter((dayData) => dayData.date >= Number(votingData?.currentPeriodStart))
                //         ?.reduce((total: number, dayData) => {
                //             return total + Number(dayData.feesUSD);
                //         }, 0) || 0;

                // TODO: Calculate incetives correctly, this solution ignores incentives in token0 and token1
                const incentivesUSD = votingPool.rewardTokenList
                    .filter(
                        (reward) =>
                            reward.address.toLowerCase() !== votingPool.token0.address.toLowerCase() &&
                            reward.address.toLowerCase() !== votingPool.token1.address.toLowerCase()
                    )
                    .reduce((total: number, reward: RewardToken) => total + reward.amountUsd, 0);

                const totalRewardsUSD = incentivesUSD + feesForCurrentEpoch;

                let vApr = 0;
                if (tokenPriceUSD && votingPool.poolVotesDeposited) {
                    const votingPowerTOKEN = Number(formatUnits(votingPool.poolVotesDeposited, 18));
                    const votingPowerUSD = votingPowerTOKEN * tokenPriceUSD;

                    if (votingPowerUSD > 0) {
                        vApr = (totalRewardsUSD / votingPowerUSD) * 52 * 100;
                    }
                }

                return {
                    id: index.toString(),
                    address: votingPool.pool,
                    gauge: votingPool.gauge,
                    token0: votingPool.token0,
                    token1: votingPool.token1,
                    vApr,
                    incentivesUSD: votingPool.isAlive ? incentivesUSD : 0,
                    totalRewardsUSD: votingPool.isAlive ? totalRewardsUSD : 0,
                    isAlive: votingPool.isAlive,
                    tvlUSD: Number(totalValueLockedUSD || 0),
                    feesUSD: feesForCurrentEpoch,
                    poolVotesDeposited: votingPool.poolVotesDeposited,
                };
            });
    }, [tokenPriceUSD, commonPools, votingPools, votingPoolsLoading]);

    return {
        data: formattedVotingPools,
        isLoading: votingPoolsLoading || isCommonPoolsLoading,
        refetch: refetchVotingPools,
    };
}
