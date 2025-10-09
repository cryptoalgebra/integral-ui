import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, X } from "lucide-react";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { FormattedVotingPool } from "../../types/voting";
import { useVeTOKENs } from "../../hooks";
import { LockSelector } from "../LockSelector";
import { VoteMap } from "../VotingPoolsList";
import { useWriteVoterVote } from "@/generated";
import { useCallback } from "react";
import { Address } from "viem";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import Loader from "@/components/common/Loader";

interface VotingActionsProps {
    pools: FormattedVotingPool[];
    tokenId: number | undefined;
    hasVoted: boolean;
    totalPercent: number;
    remainingPercent: number;
    votes: VoteMap;
    setVotes: React.Dispatch<React.SetStateAction<VoteMap>>;
    onSelectTokenId: (tokenId: number | undefined) => void;
    refetch: () => void;
}

export const VotingActions = ({
    pools,
    tokenId,
    hasVoted,
    totalPercent,
    remainingPercent,
    votes,
    setVotes,
    onSelectTokenId,
    refetch,
}: VotingActionsProps) => {
    const { veTOKENs, isLoading: isVeTOKENsLoading } = useVeTOKENs();
    const { writeContract: submitVote, data: voteHash, isPending: isVotePending } = useWriteVoterVote();

    const { isLoading: isVoteLoading } = useTransactionAwait(voteHash, {
        title: "Voting for epoch",
        type: TransactionType.POOL,
        callback: refetch,
    });

    const onRemoveVote = (poolAddress: Address) => {
        setVotes((prev) => {
            const newVotes = { ...prev };
            delete newVotes[poolAddress];
            return newVotes;
        });
    };

    const onClearVote = () => {
        setVotes({});
    };

    const onSubmitVotes = useCallback(async () => {
        if (!tokenId || hasVoted) return;

        const poolAddresses: Address[] = [];
        const weights: bigint[] = [];

        Object.entries(votes).forEach(([poolAddress, percentage]) => {
            if (percentage > 0) {
                poolAddresses.push(poolAddress as Address);
                weights.push(BigInt(Math.floor(percentage)));
            }
        });

        if (poolAddresses.length === 0) return;

        submitVote({
            args: [BigInt(tokenId), poolAddresses, weights],
        });
    }, [tokenId, hasVoted, votes, submitVote]);

    return (
        <div className="flex max-md:flex-col items-center justify-start gap-3 p-3 bg-card border border-card-border rounded-xl">
            <LockSelector veTOKENsList={veTOKENs} isLoading={isVeTOKENsLoading} onSelect={onSelectTokenId} selectedTokenId={tokenId} />
            <VotingPowerRemaining
                pools={pools}
                hasVoted={hasVoted}
                totalPercent={totalPercent}
                remainingPercent={remainingPercent}
                votes={votes}
                onRemoveVote={onRemoveVote}
            />
            <VoteActions
                hasVoted={hasVoted}
                remainingPercent={remainingPercent}
                onClearVote={onClearVote}
                onSubmitVotes={onSubmitVotes}
                isLoading={isVotePending || isVoteLoading}
            />
        </div>
    );
};

const VotingPowerRemaining = ({
    pools,
    hasVoted,
    totalPercent,
    remainingPercent,
    votes,
    onRemoveVote,
}: {
    pools: FormattedVotingPool[];
    hasVoted: boolean;
    totalPercent: number;
    remainingPercent: number;
    votes: VoteMap;
    onRemoveVote: (poolAddress: Address) => void;
}) => {
    if (hasVoted) {
        return (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-200 rounded-full animate-pulse" />
                    <p className="text-primary-200 font-medium">Already voted this epoch</p>
                </div>
                <div className="text-sm text-muted-foreground mr-1">
                    {Object.keys(votes).length} pools • {totalPercent.toFixed(2)}% allocated
                </div>
            </div>
        );
    }
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="bg-card rounded-lg px-4 py-2 flex items-center gap-x-2 justify-between md:justify-start"
                >
                    {remainingPercent > 0 && <div className="size-2 rounded-full bg-primary-200" />}
                    <div className="text-muted-foreground">Voting Power Remaining:</div>
                    <div className="w-12">{remainingPercent}%</div>
                    <ChevronDown className="size-6 transition-transform" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                side="bottom"
                align="start"
                className="w-full p-3 min-w-80 text-sm overflow-y-auto bg-card border border-bg-300 rounded-lg mt-0.5"
            >
                {Object.entries(votes).length > 0 ? (
                    <div className="flex flex-col gap-y-2">
                        {Object.entries(votes).map(([poolAddress, vote]) => {
                            const pool = pools.find((p) => p.address === poolAddress) as FormattedVotingPool;
                            if (!pool) return null;
                            return (
                                <div className="w-full bg-card-dark p-2 rounded-md flex justify-between items-center">
                                    <div className="flex gap-x-2 items-center">
                                        <CurrencyLogo currency={pool.token0} size={24} />
                                        <CurrencyLogo currency={pool.token1} className="-ml-4" size={24} />
                                        <div>
                                            {pool.token0.symbol} - {pool.token1.symbol}
                                        </div>
                                    </div>
                                    <div className="flex gap-x-2 items-center">
                                        {vote.toFixed(2)}%
                                        <Button variant="outline" size={"sm"} className="p-1 h-fit">
                                            <X
                                                onClick={() => {
                                                    onRemoveVote(poolAddress as Address);
                                                }}
                                                className="size-4 text-muted-foreground"
                                            />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col gap-y-2 w-full">
                        <span className="text-muted-foreground">No votes yet</span>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};

const VoteActions = ({
    hasVoted,
    remainingPercent,
    isLoading,
    onClearVote,
    onSubmitVotes,
}: {
    hasVoted: boolean;
    remainingPercent: number;
    isLoading: boolean;
    onClearVote: () => void;
    onSubmitVotes: () => void;
}) => {
    if (hasVoted) {
        return null;
    }

    return (
        <>
            <Button
                className="rounded-lg ml-auto min-w-32 px-4 py-2 flex items-center gap-x-12 justify-center max-md:w-full"
                disabled={hasVoted || remainingPercent < 0 || remainingPercent == 100 || isLoading}
                variant="action"
                onClick={onSubmitVotes}
            >
                {isLoading ? <Loader /> : "Submit Votes"}
            </Button>
            {remainingPercent !== 100 && (
                <Button className="gap-2 max-md:w-full" size={"sm"} variant={"outline"} onClick={onClearVote}>
                    Reset <X size={18} />
                </Button>
            )}
        </>
    );
};
