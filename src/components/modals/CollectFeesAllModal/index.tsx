import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCollectCallback } from "@/hooks/positions/useCollectCallback";
import { usePositionFees } from "@/hooks/positions/usePositionFees";
import { formatAmount } from "@/utils";
import { useMemo, useState } from "react";
import { Address } from "viem";
import { enabledModules } from "config";
import BoostedPoolsModule from "@/modules/BoostedPoolsModule";
import { ExtendedPosition } from "@/hooks/earn/useExtendedPositions";

const { useOmegaCollectCallback } = BoostedPoolsModule.hooks;

interface CollectFeesAllModalProps {
    positions: ExtendedPosition[];
    children: React.ReactNode;
}

const CollectFeesPositionRow = ({ position }: { position: ExtendedPosition }) => {
    const { pool } = position.pool;

    const { amount0, amount1, amount0Usd, amount1Usd } = usePositionFees(pool || undefined, position.id, true);

    const token0 = amount0?.currency;
    const token1 = amount1?.currency;

    const isBoostedToken0 = token0 && token0.isBoosted;
    const isBoostedToken1 = token1 && token1.isBoosted;
    const hasAnyBoostedToken = isBoostedToken0 || isBoostedToken1;
    const shouldUseOmegaRouter = enabledModules.BoostedPoolsModule && hasAnyBoostedToken;

    const omegaCollect = useOmegaCollectCallback({
        positionId: position.id,
        amount0,
        amount1,
        token0Unwrap: false,
        token1Unwrap: false,
        token0Address: pool?.token0.address as Address,
        token1Address: pool?.token1.address as Address,
    });

    const { collectCallback, isLoading, isPending, config } = useCollectCallback({
        positionId: position.id,
        amount0,
        amount1,
        token0Address: pool?.token0.address as Address,
        token1Address: pool?.token1.address as Address,
    });

    const activeCollect = useMemo(
        () =>
            shouldUseOmegaRouter
                ? omegaCollect
                : {
                      collectCallback,
                      isLoading,
                      isPending,
                      isPermitLoading: false,
                      needsPermit: false,
                      config,
                  },
        [shouldUseOmegaRouter, omegaCollect, collectCallback, isLoading, isPending, config],
    );

    const hasNoRewards = !amount0 || !amount1 ? true : amount0.equalTo("0") && amount1.equalTo("0");

    const totalUsd = (amount0Usd || 0) + (amount1Usd || 0);
    const isDisabled =
        hasNoRewards ||
        activeCollect.isLoading ||
        activeCollect.isPending ||
        activeCollect.isPermitLoading ||
        (!activeCollect.needsPermit && !activeCollect.config);

    const buttonLabel =
        activeCollect.isLoading || activeCollect.isPending || activeCollect.isPermitLoading
            ? null
            : activeCollect.needsPermit
            ? "Sign Permit"
            : "Collect";

    return (
        <li className="flex items-center justify-between rounded-xl border border-border/60 bg-panel px-4 py-3">
            <div className="min-w-0">
                <p className="text-sm font-semibold text-text">Position #{position.id}</p>
                <p className="truncate text-xs text-text-muted">{position.id}</p>
            </div>

            <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-text">${formatAmount(totalUsd, 2)}</p>
                <Button variant="primary" size="sm" disabled={isDisabled} onClick={activeCollect.collectCallback}>
                    {buttonLabel ? buttonLabel : <Loader />}
                </Button>
            </div>
        </li>
    );
};

const CollectFeesAllModal = ({ positions, children }: CollectFeesAllModalProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-[560px] rounded-xl! bg-card">
                <DialogHeader>
                    <DialogTitle className="font-bold select-none">Collect Fees</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {positions.length > 0 ? (
                        <ul className="max-h-[360px] space-y-2 overflow-auto">
                            {positions.map((position) => (
                                <CollectFeesPositionRow key={`collect-position-${position.id}`} position={position} />
                            ))}
                        </ul>
                    ) : (
                        <div className="rounded-xl border border-border/60 bg-panel p-4 text-sm text-text-muted">
                            No active positions with claimable fees.
                        </div>
                    )}

                    <Button variant="outline" size="md" className="w-full" onClick={() => setIsOpen(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CollectFeesAllModal;
