import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { useWriteRebaseRewardGetRewardForTokenId } from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { formatAmount } from "@/utils";
import { formatEther } from "viem";

export function ClaimRebaseRewardsButton({ amount, tokenId, refetch }: { amount: bigint; tokenId: bigint; refetch?: () => void }) {
    const { data, writeContractAsync: onClaimRebase, isPending } = useWriteRebaseRewardGetRewardForTokenId();
    const { isLoading } = useTransactionAwait(data, {
        title: "Claiming rebase",
        type: TransactionType.FARM,
        callback: refetch,
    });

    if (!amount) return <span>0 TOKEN</span>;

    return (
        <Button
            variant="primary"
            disabled={isPending || isLoading}
            onClick={() => onClaimRebase({ args: [tokenId] })}
            size="sm"
            className="w-fit min-w-32"
        >
            {isLoading || isPending ? <Loader /> : `Claim ${formatAmount(formatEther(amount), 6)} TOKEN`}
        </Button>
    );
}
