import { Button } from "@/components/ui/button";
import { nonfungiblePositionManagerAbi, useWriteNonfungiblePositionManagerMulticall } from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { ExtendedPosition } from "@/hooks/earn/useExtendedPositions";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { cn } from "@/utils";
import { useMemo } from "react";
import { encodeFunctionData, maxUint128 } from "viem";
import { useAccount } from "wagmi";

interface ClaimAllFeesButtonProps {
    positions: ExtendedPosition[];
    isPageLoading?: boolean;
    onSuccess?: () => void;
    className?: string;
}

const ClaimAllFeesButton = ({ positions, isPageLoading = false, onSuccess, className }: ClaimAllFeesButtonProps) => {
    const { address: account } = useAccount();
    const {
        data: collectAllHash,
        writeContract: collectAll,
        isPending: isCollectAllPending,
    } = useWriteNonfungiblePositionManagerMulticall();

    const collectablePositions = useMemo(() => positions.filter((position) => position.feesUSD > 0), [positions]);

    const collectAllCalldata = useMemo(() => {
        if (!account || collectablePositions.length === 0) return undefined;

        return collectablePositions.map((position) =>
            encodeFunctionData({
                abi: nonfungiblePositionManagerAbi,
                functionName: "collect",
                args: [
                    {
                        tokenId: BigInt(position.id),
                        recipient: account,
                        amount0Max: maxUint128,
                        amount1Max: maxUint128,
                    },
                ],
            }),
        );
    }, [account, collectablePositions]);

    const collectAllConfig = collectAllCalldata
        ? {
              args: [collectAllCalldata] as const,
              value: 0n,
          }
        : undefined;

    const { isLoading: isCollectAllLoading } = useTransactionAwait(collectAllHash, {
        title: "Collect all fees",
        type: TransactionType.POOL,
        callback: onSuccess,
    });

    const isDisabled = !account || !collectAllConfig || isCollectAllPending || isCollectAllLoading || isPageLoading;

    const handleCollectAllFees = async () => {
        if (!collectAll || !collectAllConfig) return;
        await collectAll(collectAllConfig);
    };

    return (
        <Button
            variant="primary"
            size="md"
            className={cn("whitespace-nowrap", className)}
            disabled={isDisabled}
            onClick={handleCollectAllFees}
        >
            {isCollectAllPending || isCollectAllLoading ? "Collecting..." : "Collect fees"}
        </Button>
    );
};

export default ClaimAllFeesButton;
