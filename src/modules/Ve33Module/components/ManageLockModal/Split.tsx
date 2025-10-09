import { useState, useMemo, useCallback, useEffect } from "react";
import { cn } from "@/utils/common/cn";
import { Slider } from "@/components/ui/slider";
import { parseEther } from "viem";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VeTOKEN } from "../../types";
import { useWriteVotingEscrowSplit } from "@/generated";
import { TOKEN_ADDRESS } from "config";
import { useChainId } from "wagmi";
import Loader from "@/components/common/Loader";
import { formatAmount } from "@/utils";

export const Split = ({ veTOKEN, refetch }: { veTOKEN: VeTOKEN | undefined; refetch?: () => void }) => {
    const chainId = useChainId();

    const selectedId = veTOKEN?.tokenId;

    const [amount, setAmount] = useState<number>(0);

    const maxAmount = useMemo(() => {
        if (!veTOKEN || !veTOKEN.lockedAmount) return 0;
        return Number(veTOKEN.lockedAmount) / 1e18;
    }, [veTOKEN]);

    useEffect(() => {
        if (amount > maxAmount) setAmount(maxAmount);
        if (amount < 0) setAmount(0);
    }, [amount, maxAmount]);

    const preview = useMemo(() => {
        if (!veTOKEN || amount <= 0 || amount >= maxAmount) return null;
        const originalRemaining = maxAmount - amount;
        return {
            originalRemaining,
            splitAmount: amount,
            unlockDate: veTOKEN.lockedEnd,
        };
    }, [veTOKEN, amount, maxAmount]);

    const { writeContract: splitWrite, data: splitHash, isPending: isSplitPending } = useWriteVotingEscrowSplit();

    const { isLoading: isSplitting } = useTransactionAwait(splitHash, {
        title: `Split veTOKEN #${selectedId?.toString()}`,
        description: `Splitting ${amount} TOKEN`,
        tokenA: TOKEN_ADDRESS[chainId],
        type: TransactionType.POOL,
        callback: refetch,
    });

    const hasVoted = veTOKEN?.votedThisEpoch;

    const canSplit = !!selectedId && amount > 0 && amount < maxAmount && !!splitWrite && !!veTOKEN && !hasVoted;

    const handleSplit = useCallback(async () => {
        if (!canSplit || !selectedId || !splitWrite) return;

        const valueWei = parseEther(amount.toString());
        const otherWei = parseEther((maxAmount - amount).toString());
        const arrayWei = [valueWei, otherWei];
        splitWrite({ args: [selectedId, arrayWei] });
    }, [canSplit, selectedId, amount, splitWrite]);

    const isLoading = isSplitting || isSplitPending;

    return (
        <>
            <div className="space-y-3">
                <div className="text-center">
                    Splitting {formatAmount(amount, 6)} TOKEN from lock #{selectedId?.toString()}
                </div>

                <Slider
                    min={0}
                    max={maxAmount}
                    step={maxAmount / 100}
                    value={[amount]}
                    onValueChange={(v) => setAmount(v[0] ?? 0)}
                    className="my-2"
                />
                <div className="flex justify-between text-xs text-white">
                    <span>0 TOKEN</span>
                    <span>{formatAmount(maxAmount, 4)} TOKEN</span>
                </div>
            </div>
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out overflow-hidden",
                    preview ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
            >
                {preview && (
                    <div className="transform transition-transform duration-300 ease-in-out">
                        <div className="relative flex items-center justify-center gap-3">
                            <div className="bg-card-dark border border-card-border rounded-xl p-6 w-full">
                                <div className="text-xs uppercase text-muted-foreground mb-1">New Lock</div>
                                <div className="text-lg font-bold text-white">{formatAmount(preview.splitAmount, 4)} TOKEN</div>
                            </div>
                            <ArrowRight
                                size={24}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-8 min-h-8 text-primary bg-card-dark border-2 border-primary rounded-full p-1"
                            />
                            <div className="bg-card-dark border border-card-border rounded-xl p-6 w-full">
                                <div className="text-xs uppercase text-muted-foreground mb-1">Remaining</div>
                                <div className="text-lg font-bold text-white">{formatAmount(preview.originalRemaining, 4)} TOKEN</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {hasVoted && veTOKEN && (
                <p className="text-xs text-destructive text-center">Cannot split: This veTOKEN has voted in this epoch</p>
            )}
            <Button
                variant="primary"
                disabled={!canSplit || isLoading}
                onClick={handleSplit}
                className={cn("px-6 py-2 rounded-lg font-semibold transition-colors", canSplit ? "" : "bg-muted cursor-not-allowed")}
            >
                {isLoading ? <Loader /> : "Split"}
            </Button>
        </>
    );
};
