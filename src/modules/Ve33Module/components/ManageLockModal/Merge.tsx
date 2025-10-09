import { useState, useMemo, useCallback } from "react";
import { cn } from "@/utils/common/cn";
import { formatUnits } from "viem";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Button } from "@/components/ui/button";
import { VeTOKEN } from "../../types";
import { useWriteVotingEscrowMerge } from "@/generated";
import { TOKEN_ADDRESS } from "config";
import { useChainId } from "wagmi";
import { LockSelector } from "../LockSelector";
import { formatAmount } from "@/utils";
import { Plus } from "lucide-react";
import Loader from "@/components/common/Loader";
import { getTimeUntilTimestamp } from "../../utils";

export const Merge = ({
    veTOKEN,
    veTOKENsList,
    refetch,
}: {
    veTOKEN: VeTOKEN | undefined;
    veTOKENsList: VeTOKEN[];
    refetch?: () => void;
}) => {
    const chainId = useChainId();

    const [targetId, setTargetId] = useState<bigint | undefined>();

    const veTOKENsListWithoutSource = useMemo(() => {
        if (!veTOKENsList || !veTOKEN) return [];
        return veTOKENsList.filter((v) => v.tokenId !== veTOKEN.tokenId);
    }, [veTOKENsList, veTOKEN]);

    const { totalLockedAmount, totalBalance, maxLockedEnd } = useMemo(() => {
        if (!targetId) return {};
        if (!veTOKENsList) return {};

        const source = veTOKEN;
        const target = veTOKENsList.find((v) => v.tokenId === targetId);

        if (!target || !source) return {};

        const totalLockedAmount = (target.lockedAmount || 0n) + (source.lockedAmount || 0n);
        const totalBalance = (target.balance || 0n) + (source.balance || 0n);
        const maxLockedEnd = (target.lockedEnd || 0n) > (source.lockedEnd || 0n) ? target.lockedEnd : source.lockedEnd;

        return {
            totalLockedAmount: formatUnits(totalLockedAmount, 18),
            totalBalance: formatUnits(totalBalance, 18),
            maxLockedEnd: maxLockedEnd ? getTimeUntilTimestamp(maxLockedEnd).display : "N/A",
        };
    }, [targetId, veTOKENsList, veTOKEN]);

    const { writeContractAsync: mergeWrite, data: mergeHash, isPending: isMergePending } = useWriteVotingEscrowMerge();

    const { isLoading: isMerging } = useTransactionAwait(mergeHash, {
        title: `Merge veTOKEN #${veTOKEN?.tokenId?.toString()} → #${targetId?.toString()}`,
        tokenA: TOKEN_ADDRESS[chainId],
        type: TransactionType.POOL,
        callback: refetch,
    });

    const sourceHasVoted = veTOKEN?.votedThisEpoch;
    const targetHasVoted = veTOKENsList?.find((v) => v.tokenId === targetId)?.votedThisEpoch;

    const canMerge = !!targetId && !!mergeWrite && !sourceHasVoted && !targetHasVoted;

    const handleMerge = useCallback(async () => {
        if (!mergeWrite || !targetId || !veTOKEN) return;

        mergeWrite({ args: [veTOKEN.tokenId, targetId] });
    }, [mergeWrite, targetId, veTOKEN]);

    const isLoading = isMergePending || isMerging;

    if (veTOKENsListWithoutSource.length === 0)
        return <div className="flex min-h-64 flex-col items-center justify-center">No other veTOKEN to merge</div>;

    return (
        <>
            <div className="flex mt-3 w-full justify-between items-center">
                <span>Source</span>
                <span>Target</span>
            </div>
            <div className="flex gap-2 w-full justify-between items-center">
                <div className="py-0 px-4 h-10 min-w-50  border border-bg-300 rounded-lg justify-between flex gap-x-2 items-center whitespace-nowrap w-fit">
                    <span className="font-semibold text-text-200">#{veTOKEN?.tokenId.toString()}</span>
                    <div className="flex gap-x-1 items-center">
                        {veTOKEN && (
                            <span className="text-sm font-medium text-muted-foreground">
                                {formatAmount(formatUnits(veTOKEN.balance, 18), 6)} veTOKEN
                            </span>
                        )}
                    </div>
                </div>
                <Plus size={24} />

                <LockSelector
                    selectedTokenId={Number(targetId)}
                    isLoading={veTOKENsList.length === 0}
                    veTOKENsList={veTOKENsListWithoutSource}
                    onSelect={(v) => v && setTargetId(BigInt(v))}
                />
            </div>

            <div className="transition-all mt-3 duration-300 ease-in-out overflow-hidden flex flex-col gap-3">
                <div className="grid grid-cols-3 h-full items-center justify-center gap-3 w-full">
                    <div className="bg-card-dark h-full border border-card-border rounded-xl p-6 w-full">
                        <div className="text-xs uppercase text-muted-foreground mb-1">Total Locked</div>
                        <div className="text-lg font-bold text-white">{formatAmount(totalLockedAmount || 0, 6)} TOKEN</div>
                    </div>
                    <div className="bg-card-dark h-full border border-card-border rounded-xl p-6 w-full">
                        <div className="text-xs uppercase text-muted-foreground mb-1">Voting Power</div>
                        <div className="text-lg font-bold text-white">{formatAmount(totalBalance || 0, 6)} veTOKEN</div>
                    </div>
                    <div className="bg-card-dark h-full border border-card-border rounded-xl p-6 w-full">
                        <div className="text-xs uppercase text-muted-foreground mb-1">Unlock Date</div>
                        <div className="text-lg font-bold text-white">{maxLockedEnd}</div>
                    </div>
                </div>

                {(sourceHasVoted || targetHasVoted) && veTOKEN && (
                    <p className="text-xs text-destructive text-center">
                        Cannot merge: {sourceHasVoted ? "Source" : "Target"} veTOKEN has voted in this epoch
                    </p>
                )}
                <Button
                    variant="primary"
                    disabled={!canMerge || isLoading}
                    onClick={handleMerge}
                    className={cn("px-6 py-2 rounded-lg font-semibold transition-colors")}
                >
                    {isLoading ? <Loader /> : "Merge"}
                </Button>
            </div>
        </>
    );
};
