import { Button } from "@/components/ui/button";
import { useWriteNonfungiblePositionManagerMulticall } from "@/generated";
import { useTransactionAwait } from "@/hooks/common/useTransactionAwait";
import { ExtendedPosition } from "@/hooks/earn/useExtendedPositions";
import { TransactionType } from "@/state/pendingTransactionsStore";
import { unwrappedToken } from "@/utils/common/unwrappedToken";
import { NonfungiblePositionManager } from "@/utils/mint/nfpm";
import { cn } from "@/utils";
import { useMemo } from "react";
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

    const { calldata: collectAllCalldata, value: collectAllValue } = useMemo(() => {
        if (!account || collectablePositions.length === 0) return { calldata: undefined, value: undefined };

        return NonfungiblePositionManager.collectAllCallParameters(
            collectablePositions.map((position) => ({
                tokenId: position.id.toString(),
                recipient: account,
                currency0: unwrappedToken(position.pool.pool.token0),
                currency1: unwrappedToken(position.pool.pool.token1),
            })),
        );
    }, [account, collectablePositions]);

    const collectAllConfig = collectAllCalldata
        ? {
              args: [collectAllCalldata as `0x${string}`[]] as const,
              value: BigInt(collectAllValue || 0),
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
