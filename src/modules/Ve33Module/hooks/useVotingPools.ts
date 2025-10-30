import { useMemo } from "react";
import { useChainId, useReadContracts } from "wagmi";
import { votingRewardABI } from "config/abis";
import { Address, formatUnits } from "viem";
import { useClients } from "@/hooks/graphql/useClients";
import { usePoolsListQuery } from "@/graphql/generated/graphql";
import { isDefined } from "@/utils";
import { useReadVoterGetCurrentPeriod } from "@/generated";
import { RewardToken, VotingPool } from "../types/voting";
import { useAllGauges } from "./useAllGauges";
import { useAllTokens } from "@/hooks/tokens/useAllTokens";
import { useNativePriceUSD } from "@/hooks/common/useNativePriceUSD";
import { Token } from "@cryptoalgebra/custom-pools-sdk";

export function useVotingPools() {
    const chainId = useChainId();
    const { tokens, isLoading: tokensLoading } = useAllTokens();
    const { data: gaugeList, isLoading: gaugesLoading } = useAllGauges();

    const { infoClient } = useClients();
    const { data: pools, loading: poolsLoading } = usePoolsListQuery({ client: infoClient });

    const poolsList = useMemo(() => pools?.pools ?? [], [pools]);

    const { data: currentPeriod, isLoading: currentPeriodLoading } = useReadVoterGetCurrentPeriod();

    const nextPeriod = currentPeriod ? currentPeriod + 1n : 0n;

    const { data: poolVotesResults, isLoading: poolVotesLoading, refetch: refetchPoolVotes } = useReadContracts({
        contracts: gaugeList.map((g) => ({
            address: g.votingReward,
            abi: votingRewardABI,
            functionName: "totalVotesInPeriod",
            args: [nextPeriod], // getting votes for next period
        })),
        query: { enabled: gaugeList.length > 0 && !!nextPeriod },
    });

    const poolVotesAmounts: bigint[] = useMemo(() => poolVotesResults?.map((d) => (d?.result as bigint) ?? 0n) ?? [], [poolVotesResults]);

    const { data: rewardTokensResults, isLoading: rewardTokensLoading } = useReadContracts({
        contracts: gaugeList.map((g) => ({
            address: g.votingReward,
            abi: votingRewardABI,
            functionName: "getRewardList",
        })),
        query: { enabled: gaugeList.length > 0 },
    });

    const rewardTokensByGauge: Address[][] = useMemo(() => {
        if (!rewardTokensResults) return [];
        return rewardTokensResults.map((d) => (Array.isArray(d?.result) ? d.result : [d?.result]).filter(isDefined));
    }, [rewardTokensResults]);

    // --- rewards per gauge+token ---
    const contractsMeta = useMemo(() => {
        const meta: { gaugeIndex: number; token: Address }[] = [];
        gaugeList.forEach((g, gIndex) => {
            rewardTokensByGauge[gIndex]?.forEach((tokenAddr) => {
                meta.push({ gaugeIndex: gIndex, token: tokenAddr });
            });
        });
        return meta;
    }, [gaugeList, rewardTokensByGauge]);

    const { data: poolRewardResults, isLoading: poolRewardLoading } = useReadContracts({
        contracts: contractsMeta.map((m) => ({
            address: gaugeList[m.gaugeIndex].votingReward,
            abi: votingRewardABI,
            functionName: "rewardForPeriod",
            args: [currentPeriod ?? 0n, m.token],
        })),
        query: { enabled: contractsMeta.length > 0 && !!currentPeriod },
    });

    const { nativePriceUSD } = useNativePriceUSD();

    const rewardMap: Record<number, RewardToken[]> = useMemo(() => {
        const map: Record<number, RewardToken[]> = {};
        if (!poolRewardResults) return map;

        // helper
        const getDecimalsByTokenAddress = (tokenAddress: Address) => {
            const token = tokens.find((t) => t.id.toLowerCase() === tokenAddress.toLowerCase());
            return Number(token?.decimals || 18);
        };

        // helper
        const getPriceByTokenAddress = (tokenAddress: Address) => {
            const token = tokens.find((t) => t.id.toLowerCase() === tokenAddress.toLowerCase());
            return Number(token?.derivedMatic || 0) * nativePriceUSD;
        };

        poolRewardResults.forEach((res, i) => {
            const meta = contractsMeta[i];
            const amount = (res?.result as bigint) ?? 0n;
            const decimals = getDecimalsByTokenAddress(meta.token);
            const amountUsd = getPriceByTokenAddress(meta.token) * Number(formatUnits(amount, decimals));

            if (!map[meta.gaugeIndex]) map[meta.gaugeIndex] = [];
            map[meta.gaugeIndex].push({
                address: meta.token,
                amount,
                decimals,
                amountUsd,
            });
        });

        return map;
    }, [poolRewardResults, contractsMeta, tokens, nativePriceUSD]);

    const votingPools: VotingPool[] = useMemo(() => {
        if (!poolsList || !gaugeList || !tokens) return [];

        return gaugeList.map((g, i) => {
            const pool = poolsList[i];
            const rewardTokenList = rewardMap[i] ?? [];

            return {
                ...g,
                pool: pool.id as Address,
                token0: new Token(chainId, pool.token0.id as Address, Number(pool.token0.decimals), pool.token0.symbol, pool.token0.name),
                token1: new Token(chainId, pool.token1.id as Address, Number(pool.token1.decimals), pool.token1.symbol, pool.token1.name),
                poolVotesDeposited: poolVotesAmounts[i] ?? 0n,
                rewardTokenList,
            };
        });
    }, [poolsList, gaugeList, tokens, rewardMap, poolVotesAmounts, chainId]);

    const isLoading =
        tokensLoading ||
        poolsLoading ||
        currentPeriodLoading ||
        gaugesLoading ||
        rewardTokensLoading ||
        poolRewardLoading ||
        poolVotesLoading;

    return { data: votingPools, isLoading, refetch: refetchPoolVotes };
}
