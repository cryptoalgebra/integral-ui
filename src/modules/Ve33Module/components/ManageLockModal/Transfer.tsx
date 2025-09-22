import { useState } from "react";
import { cn } from "@/utils/common/cn";
import { Button } from "@/components/ui/button";
import { isAddress } from "viem";
import { useAccount } from "wagmi";
import { Address } from "viem";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { VeALGB } from "../../types";
import { useWriteVeAlgbSafeTransferFrom } from "@/generated";
import Loader from "@/components/common/Loader";

export const Transfer = ({ veALGB, refetch }: { veALGB: VeALGB | undefined; refetch?: () => void }) => {
    const [targetAddress, setTargetAddress] = useState<string>("");

    const isValidAddress = targetAddress && isAddress(targetAddress);
    const { address: account } = useAccount();

    const hasVoted = veALGB?.votedThisEpoch || false;

    const canSend = isValidAddress && veALGB && !hasVoted;

    const { writeContract: transferWrite, data: txHash, isPending: isTransferPending } = useWriteVeAlgbSafeTransferFrom();

    const { isLoading: isTransferLoading } = useTransactionAwait(txHash, {
        title: `Transfer veALGB`,
        tokenId: veALGB?.tokenId?.toString(),
        type: TransactionType.POOL,
        callback: refetch,
    });

    const handleSend = async () => {
        if (!transferWrite || !account || !veALGB || !isValidAddress) return;

        transferWrite({
            args: [account as Address, targetAddress as Address, veALGB.tokenId],
        });
    };

    return (
        <>
            <div className="flex flex-col gap-3 w-full">
                <div className="flex flex-col gap-2">
                    <label htmlFor="address" className="text-sm font-medium text-muted-foreground">
                        Recipient address
                    </label>
                    <input
                        id="address"
                        placeholder="0x…"
                        value={targetAddress}
                        onChange={(e) => setTargetAddress(e.target.value.trim())}
                        type="text"
                        className={cn(
                            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
                            targetAddress && !isValidAddress && "border-destructive/60"
                        )}
                    />
                    {targetAddress && !isValidAddress && <span className="text-xs text-destructive">Invalid address</span>}
                </div>

                <Button
                    disabled={!canSend || isTransferLoading || isTransferPending}
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleSend}
                >
                    {isTransferLoading || isTransferPending ? <Loader /> : "Send"}
                </Button>
                {hasVoted && veALGB && (
                    <p className="text-xs text-destructive text-center">Cannot transfer: This veALGB has voted in this epoch</p>
                )}
            </div>

            <div className="w-full bg-card-dark p-3 rounded-xl">
                <h4 className="text-white font-medium mb-4">Transferring veALGB</h4>

                <div className="space-y-4 text-sm text-left">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">1</div>
                        <p className="text-gray-300 text-left">
                            veALGB is a transferable NFT. You can transfer it to another address or sell it on the NFT marketplace.
                        </p>
                    </div>
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">2</div>
                        <p className="text-gray-300 text-left">Transfers are only allowed if you haven't voted in the current epoch.</p>
                    </div>
                </div>
            </div>
        </>
    );
};
