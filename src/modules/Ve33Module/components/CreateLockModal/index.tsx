import { Slider } from "@/components/ui/slider";
import { useState, useMemo, useCallback } from "react";
import { parseEther } from "viem";
import { useAccount, useChainId } from "wagmi";
import { TOKEN_ADDRESS, VOTING_ESCROW } from "config";
import { useAlgebraToken } from "@/hooks/common/useAlgebraToken";
import { CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useApprove } from "@/hooks/common/useApprove";
import { ApprovalState } from "@/types/approve-state";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Button } from "@/components/ui/button";
import { useWriteVotingEscrowCreateLock } from "@/generated";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EnterAmountCard from "@/components/create-position/EnterAmountsCard";
import Loader from "@/components/common/Loader";
import { useVeTOKENs } from "../../hooks";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";

export const CreateLockModal = ({ children }: { children: React.ReactNode }) => {
    const { refetch } = useVeTOKENs();
    const { address: account, isConnected } = useAccount();
    const chainId = useChainId();

    const [amount, setAmount] = useState<string>("");

    const [weeks, setWeeks] = useState<number>(1);

    const lockToken = useAlgebraToken(TOKEN_ADDRESS[chainId], chainId);

    const amountToApprove = useMemo(() => {
        if (!lockToken || !amount || Number(amount) === 0 || isNaN(Number(amount))) return undefined;
        try {
            const raw = parseEther(amount);
            return CurrencyAmount.fromRawAmount(lockToken, raw.toString());
        } catch {
            return undefined;
        }
    }, [lockToken, amount]);

    const { formatted: amountUSD } = useUSDCValue(amountToApprove);

    const { approvalState, approvalCallback } = useApprove(amountToApprove, VOTING_ESCROW[chainId]);

    const needsApproval = approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING;

    const { writeContract: createLock, data: txHash, isPending: txPending } = useWriteVotingEscrowCreateLock();

    const { isLoading: txLoading } = useTransactionAwait(txHash, {
        title: `Lock ${amount || "0"} TOKEN for ${weeks} week${weeks > 1 ? "s" : ""}`,
        tokenA: TOKEN_ADDRESS[chainId],
        type: TransactionType.POOL,
        callback: refetch,
    });

    const veTOKENAmount = useMemo(() => {
        if (!amount || Number(amount) === 0 || isNaN(Number(amount))) return 0;
        const durationSeconds = weeks * 7 * 24 * 60 * 60; // weeks -> seconds

        const MAXTIME = 2 * 365 * 24 * 60 * 60;

        const lockDuration = Math.min(durationSeconds, MAXTIME);

        const veTOKENAmount = (Number(amount) * lockDuration) / MAXTIME;

        return Math.max(0, veTOKENAmount);
    }, [amount, weeks]);

    const handleCreateLock = useCallback(async () => {
        if (!createLock || !account || !amount || Number(amount) === 0 || isNaN(Number(amount))) return;

        const value = parseEther(amount);
        const durationSeconds = BigInt(weeks * 7 * 24 * 60 * 60); // weeks -> seconds
        createLock({ args: [value, durationSeconds] });
    }, [createLock, amount, weeks, account]);

    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-[500px] rounded-xl! bg-card">
                <DialogHeader>
                    <DialogTitle className="font-bold select-none mt-2 max-md:mx-auto">Create New Lock</DialogTitle>
                </DialogHeader>
                <EnterAmountCard currency={lockToken} value={amount} valueUsd={amountUSD} handleChange={setAmount} />

                <div className="">
                    <div className="bg-card-dark rounded-lg p-3 space-y-2">
                        <div className="text-center">
                            Locking {amount || 0} TOKEN for {weeks} week
                            {weeks > 1 ? "s" : ""}
                        </div>
                        {veTOKENAmount > 0 && (
                            <div className="text-center text-primary font-semibold">Will receive: {veTOKENAmount.toFixed(4)} veTOKEN</div>
                        )}
                    </div>

                    <Slider min={1} max={104} step={1} value={[weeks]} onValueChange={(vals) => setWeeks(vals[0])} className="my-2" />
                    <div className="flex justify-between text-xs text-white">
                        <span>1 week</span>
                        <span>6 months</span>
                        <span>1 year</span>
                        <span>1.5 years</span>
                        <span>2 years</span>
                    </div>
                </div>

                {needsApproval ? (
                    <Button
                        variant="primary"
                        className="w-full flex items-center justify-center gap-2 text-lg font-semibold"
                        onClick={approvalCallback}
                        disabled={approvalState === ApprovalState.PENDING || txLoading || txPending}
                    >
                        {approvalState === ApprovalState.PENDING ? <Loader /> : "Approve TOKEN"}
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        className="w-full flex items-center justify-center gap-2 text-lg font-semibold"
                        onClick={handleCreateLock}
                        disabled={txLoading || !amount || Number(amount) === 0 || txPending || !isConnected}
                    >
                        {txLoading || txPending ? <Loader /> : !isConnected ? "Connect Wallet" : "Create Lock"}
                    </Button>
                )}
            </DialogContent>
        </Dialog>
    );
};
