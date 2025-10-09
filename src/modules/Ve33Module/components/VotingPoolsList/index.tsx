import {
    useReadVotingEscrowBalanceOfNft,
    useReadVoterGetCurrentPeriod,
    useReadVoterCheckPeriodVoted,
    useReadVoterGetTokenIdVotes,
} from "@/generated";
import { useState, useMemo, useCallback } from "react";
import { useVotingData, useFormattedVotingPools } from "../../hooks";
import { VotingPoolsTable } from "../Table";
import { VotingActions } from "../VotingActions";
import { Address } from "viem";

export interface VoteMap {
    [poolAddress: Address]: number;
}

export const VotingPoolsList = () => {
    const [votes, setVotes] = useState<VoteMap>({});

    const [selectedTokenId, setSelectedTokenId] = useState<number | undefined>();

    const { data: lockedAmount } = useReadVotingEscrowBalanceOfNft({
        args: [BigInt(selectedTokenId ?? 0)],
    });

    const { data: votingData, isLoading: votingDataLoading, refetch: refetchVotingData } = useVotingData();

    const { data: pools, isLoading: poolsLoading, refetch: refetchPools } = useFormattedVotingPools();

    const { data: currentPeriod } = useReadVoterGetCurrentPeriod();
    const nextPeriod = currentPeriod ? currentPeriod + 1n : 0n;

    const { data: hasVotedData, refetch: refetchHasVoted } = useReadVoterCheckPeriodVoted({
        args: [nextPeriod, BigInt(selectedTokenId ?? 0)],
    });

    const { data: tokenVotesData, refetch: refetchTokenVotes } = useReadVoterGetTokenIdVotes({
        args: [nextPeriod, BigInt(selectedTokenId ?? 0)],
    });

    const hasVotedDerived = useMemo(() => !!hasVotedData, [hasVotedData]);

    const existingVotesPercentMap = useMemo(() => {
        if (!tokenVotesData || !Array.isArray(tokenVotesData)) return {} as Record<string, number>;
        const poolsArr = tokenVotesData[0] as Address[] | undefined;
        const weightsArr = tokenVotesData[1] as bigint[] | undefined;
        if (!poolsArr || !weightsArr) return {} as Record<string, number>;
        const locked = lockedAmount ?? 0n;
        if (locked === 0n) return {} as Record<string, number>;
        const map: Record<string, number> = {};
        poolsArr.forEach((poolAddress: Address, index: number) => {
            const w = Number(weightsArr[index] ?? 0n);
            const pct = Math.max(0, Math.min(100, (w / Number(locked)) * 100));
            map[poolAddress.toLowerCase()] = Number(pct.toFixed(2));
        });
        return map;
    }, [tokenVotesData, lockedAmount]);

    const isReadOnly = hasVotedDerived;

    const displayVotes = hasVotedDerived ? existingVotesPercentMap : votes;

    const { totalPercent, remainingPercent } = useMemo(() => {
        const total = Object.values(displayVotes).reduce((sum, val) => sum + val, 0);
        const remaining = 100 - total;
        return {
            totalPercent: total,
            remainingPercent: remaining,
        };
    }, [displayVotes]);

    const handleRefetch = useCallback(() => {
        refetchVotingData();
        refetchHasVoted();
        refetchTokenVotes();
        refetchPools();
    }, [refetchHasVoted, refetchTokenVotes, refetchVotingData, refetchPools]);

    return (
        <>
            <VotingActions
                pools={pools}
                tokenId={selectedTokenId}
                hasVoted={hasVotedDerived}
                totalPercent={totalPercent}
                remainingPercent={remainingPercent}
                votes={displayVotes}
                setVotes={setVotes}
                onSelectTokenId={setSelectedTokenId}
                refetch={handleRefetch}
            />
            <VotingPoolsTable
                pools={pools}
                votes={displayVotes}
                setVotes={setVotes}
                votingData={votingData}
                isReadOnly={isReadOnly}
                selectedTokenId={selectedTokenId}
                isLoading={votingDataLoading || poolsLoading}
            />
        </>
    );
};
