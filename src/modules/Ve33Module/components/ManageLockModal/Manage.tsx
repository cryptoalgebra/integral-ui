import { useState, useMemo, useCallback, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { parseEther } from "viem";
import { useAlgebraToken } from "@/hooks/common/useAlgebraToken";
import { ALGB_TOKEN_ADDRESS, DEFAULT_CHAIN_ID, VE_ALGB } from "config";
import { CurrencyAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useApprove } from "@/hooks/common/useApprove";
import { ApprovalState } from "@/types/approve-state";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import { VeALGB } from "../../types";
import { useWriteVeAlgbIncreaseAmount, useWriteVeAlgbIncreaseUnlockTime, useWriteVeAlgbWithdraw } from "@/generated";
import EnterAmountCard from "@/components/create-position/EnterAmountsCard";
import Loader from "@/components/common/Loader";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";

interface ManageLockModalProps {
    veALGB: VeALGB;
    children?: React.ReactNode;
    refetch?: () => void;
}

export const Manage = ({ veALGB, refetch }: ManageLockModalProps) => {
    const { tokenId, lockedEnd } = veALGB;
    const chainId = useChainId();

    const [amount, setAmount] = useState<string>("");
    const { address: account } = useAccount();

    const algbToken = useAlgebraToken(ALGB_TOKEN_ADDRESS[chainId], chainId);

    const amountToApprove = useMemo(() => {
        if (!algbToken || !amount || Number(amount) === 0 || isNaN(Number(amount))) return undefined;
        try {
            const raw = parseEther(amount);
            return CurrencyAmount.fromRawAmount(algbToken, raw.toString());
        } catch {
            return undefined;
        }
    }, [algbToken, amount]);

    const { approvalState, approvalCallback } = useApprove(amountToApprove, VE_ALGB[DEFAULT_CHAIN_ID]);
    const needsApproval = approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING;

    const { formatted: amountUSD } = useUSDCValue(amountToApprove);

    const {
        writeContract: increaseAmountWrite,
        isPending: isIncreaseAmountPending,
        data: increaseAmountHash,
    } = useWriteVeAlgbIncreaseAmount();
    const { isLoading: isIncreaseAmountLoading } = useTransactionAwait(increaseAmountHash, {
        title: `Increase lock #${tokenId.toString()}`,
        description: `Adding ${amount || 0} ALGB`,
        tokenA: ALGB_TOKEN_ADDRESS[chainId],
        type: TransactionType.POOL,
        callback: refetch,
    });

    const handleIncreaseAmount = useCallback(async () => {
        if (!increaseAmountWrite || !amount || !account || Number(amount) === 0 || isNaN(Number(amount))) return;
        try {
            const valueWei = parseEther(amount);
            increaseAmountWrite({ args: [tokenId, valueWei] });
        } catch (err) {
            console.error(err);
        }
    }, [increaseAmountWrite, tokenId, amount, account]);

    const MAX_LOCK_WEEKS = 104; // 2 years
    const secondsInWeek = 7 * 24 * 60 * 60;

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const currentLockEndInWeeks = lockedEnd ? Math.floor(Number(lockedEnd) / secondsInWeek) : 0;
    const currentTimeInWeeks = Math.floor(currentTimestamp / secondsInWeek);
    const weeksRemaining = Math.max(0, currentLockEndInWeeks - currentTimeInWeeks);

    const maxPossibleLockEndInWeeks = Math.floor((currentTimestamp + MAX_LOCK_WEEKS * secondsInWeek) / secondsInWeek);
    const maxExtendableWeeks = Math.max(0, maxPossibleLockEndInWeeks - currentLockEndInWeeks);

    const [weeks, setWeeks] = useState<number>(maxExtendableWeeks === 0 ? 0 : Math.min(52, maxExtendableWeeks));

    useEffect(() => {
        if (weeks > maxExtendableWeeks) {
            setWeeks(maxExtendableWeeks);
        }
    }, [maxExtendableWeeks]);

    const { writeContract: extendTimeWrite, isPending: isExtendPending, data: extendHash } = useWriteVeAlgbIncreaseUnlockTime();
    const { isLoading: isExtendLoading } = useTransactionAwait(extendHash, {
        title: `Extend lock #${tokenId.toString()}`,
        description: `Extending by ${weeks} week${weeks > 1 ? "s" : ""}`,
        tokenA: ALGB_TOKEN_ADDRESS[chainId],
        type: TransactionType.POOL,
        callback: refetch,
    });

    const handleExtendTime = useCallback(async () => {
        if (!extendTimeWrite || !weeks || weeks === 0) return;
        try {
            const newTotalWeeks = weeksRemaining + weeks;
            const durationSeconds = BigInt(newTotalWeeks * secondsInWeek);
            extendTimeWrite({ args: [tokenId, durationSeconds] });
        } catch (err) {
            console.error(err);
        }
    }, [extendTimeWrite, tokenId, weeks, weeksRemaining, maxExtendableWeeks]);

    const now = dayjs();
    const unlockDate = lockedEnd && lockedEnd > 0n ? dayjs.unix(Number(lockedEnd)) : null;
    const isUnlocked = unlockDate ? unlockDate.isBefore(now) : false;

    const { writeContract: withdrawWrite, isPending: isWithdrawPending, data: withdrawHash } = useWriteVeAlgbWithdraw();
    const { isLoading: isWithdrawLoading } = useTransactionAwait(withdrawHash, {
        title: `Withdraw lock #${tokenId.toString()}`,
        description: `Withdrawing unlocked ALGB`,
        tokenA: ALGB_TOKEN_ADDRESS[chainId],
        type: TransactionType.POOL,
        callback: refetch,
    });

    const handleWithdraw = useCallback(async () => {
        if (!withdrawWrite) return;

        withdrawWrite({ args: [tokenId] });
    }, [withdrawWrite, tokenId]);

    return (
        <>
            <div>
                <h4 className="text-white font-medium">Increase Amount</h4>
                <div className="mt-2 space-y-4">
                    <EnterAmountCard currency={algbToken} value={amount} valueUsd={amountUSD} handleChange={setAmount} />

                    {needsApproval ? (
                        <Button
                            variant="primary"
                            className="w-full flex items-center justify-center gap-2 h-12"
                            onClick={approvalCallback}
                            disabled={approvalState === ApprovalState.PENDING || isIncreaseAmountPending}
                        >
                            {approvalState === ApprovalState.PENDING && <Loader2 size={18} className="animate-spin" />}
                            {approvalState === ApprovalState.PENDING ? "Approving…" : "Approve ALGB"}
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            className="w-full flex items-center justify-center gap-2 h-12"
                            onClick={handleIncreaseAmount}
                            disabled={isIncreaseAmountLoading || isIncreaseAmountPending || !amount || Number(amount) === 0}
                        >
                            {isIncreaseAmountPending || isIncreaseAmountLoading ? <Loader /> : "Increase Amount"}
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4 py-4 border-b border-card-border/50">
                <h4 className="text-white font-medium">Extend Lock Time</h4>

                {maxExtendableWeeks === 0 ? (
                    <div className="bg-secondary rounded-lg p-3 text-center text-muted-foreground text-sm">
                        Already locked for the maximum 2 years
                    </div>
                ) : (
                    <>
                        <Slider min={1} max={maxExtendableWeeks} step={1} value={[weeks]} onValueChange={(vals) => setWeeks(vals[0])} />

                        <div className="text-center text-sm text-muted-foreground">
                            Adding {weeks} week{weeks !== 1 ? "s" : ""} (max {maxExtendableWeeks} week
                            {maxExtendableWeeks !== 1 ? "s" : ""} available)
                        </div>

                        <Button
                            variant="primary"
                            className="w-full flex items-center justify-center gap-2 h-12"
                            onClick={handleExtendTime}
                            disabled={isExtendPending || isExtendLoading || weeks === 0}
                        >
                            {isExtendPending || isExtendLoading ? <Loader /> : "Extend Lock Time"}
                        </Button>
                    </>
                )}
            </div>

            <div className="space-y-4 py-4">
                <h4 className="text-white font-medium">Withdraw</h4>
                {isUnlocked ? (
                    <Button
                        variant="destructive"
                        className="w-full flex items-center justify-center gap-2 h-12 bg-error-100"
                        onClick={handleWithdraw}
                        disabled={isWithdrawPending || isWithdrawLoading}
                    >
                        {isWithdrawPending || isWithdrawLoading ? <Loader /> : "Withdraw"}
                    </Button>
                ) : (
                    <div className="text-center text-muted-foreground text-sm bg-bg-400 rounded-xl p-3 border border-bg-500">
                        Lock period has not yet expired.
                    </div>
                )}
            </div>
        </>
    );
};
