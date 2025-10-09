import { useMemo } from "react";
import { useChainId, useReadContracts } from "wagmi";
import { VOTING_ESCROW, VOTER } from "config/contract-addresses";
import { voterABI } from "config/abis";
import { VotingData } from "../types/voting";
import { votingEscrowAbi } from "@/generated";

export function useVotingData() {
    const chainId = useChainId();

    const { data: baseData, isLoading: baseDataLoading } = useReadContracts<[bigint, bigint, bigint]>({
        contracts: [
            { address: VOTER[chainId], abi: voterABI, functionName: "getCurrentPeriod" },
            { address: VOTER[chainId], abi: voterABI, functionName: "DURATION" },
            { address: VOTER[chainId], abi: voterABI, functionName: "epoch0Period" },
        ],
    });

    const currentPeriod = (baseData?.[0]?.result as bigint) || 0n;

    const { data: periodData, isLoading: periodDataLoading, refetch } = useReadContracts({
        contracts: [
            {
                address: VOTER[chainId],
                abi: voterABI,
                functionName: "period",
                args: [currentPeriod],
            },
            {
                address: VOTER[chainId],
                abi: voterABI,
                functionName: "period",
                args: [currentPeriod + 1n], // getting votes for next period
            },
            {
                address: VOTING_ESCROW[chainId],
                abi: votingEscrowAbi,
                functionName: "totalVotingPower",
            },
        ],
        query: { enabled: !!currentPeriod },
    });

    const votingData: VotingData | undefined = useMemo(() => {
        if (!baseData || !periodData) return undefined;

        const duration = (baseData[1]?.result as bigint) || 0n;

        const [, totalEmissions] = (periodData[0]?.result as [bigint, bigint, bigint]) ?? [0n, [], []];
        const [totalVotes] = (periodData[1]?.result as [bigint, bigint, bigint]) ?? [0n, [], []];
        const totalAvailableVotes = (periodData[2]?.result as bigint) ?? [0n];

        const nextPeriod = currentPeriod + 1n;
        const nowTimestamp = BigInt(Math.floor(Date.now() / 1000));

        const currentPeriodStart = currentPeriod * duration;
        const currentPeriodEnd = currentPeriodStart + duration;

        const isVotingOpen = nowTimestamp >= currentPeriodStart && nowTimestamp < currentPeriodEnd;

        return {
            currentPeriod,
            nextPeriod,
            isVotingOpen,
            currentPeriodStart,
            currentPeriodEnd,
            totalVotes,
            totalAvailableVotes,
            epoch: currentPeriod,
            totalEmissions,
        };
    }, [baseData, currentPeriod, periodData]);

    return {
        data: votingData,
        isLoading: baseDataLoading || periodDataLoading,
        refetch,
    };
}
