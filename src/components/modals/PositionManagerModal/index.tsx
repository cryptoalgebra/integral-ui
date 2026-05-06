import { Dialog, DialogContent } from "@/components/ui/dialog";
import { INITIAL_POOL_FEE } from "@cryptoalgebra/integral-sdk";
import { Deposit, EternalFarming } from "@/graphql/generated/graphql";
import { useCallback } from "react";
import { PositionModalHeader } from "./PositionModalHeader";
import { DepositSection } from "./DepositSection";
import { FeesSection } from "./FeesSection";
import { ChartSection } from "./ChartSection";
import { ManageSection } from "./ManageSection";
import { MetrcisSection } from "./MetricsSction";
import FarmingModule from "@/modules/FarmingModule";
import { ExtendedPosition } from "@/hooks/earn/useExtendedPositions";
import { Farming } from "@/types/farming-info";
import { useDerivedMintInfo } from "@/state/mintStore";
import { usePositionAnalytics } from "@/hooks/positions/usePositionAnalytics";
import { Address } from "viem";
import { useCurrency } from "@/hooks/common/useCurrency";
const { HarvestAndExitFarmingCard } = FarmingModule.components;
const { usePositionInFarming } = FarmingModule.hooks;

interface PositionCardProps {
    selectedPosition: ExtendedPosition | null | undefined;
    farming?: Farming | null;
    closedFarmings?: EternalFarming[] | null;
    onClose?: () => void;
    refetch: () => void;
}

const PositionManagerModal = ({ selectedPosition, farming, closedFarmings, onClose, refetch }: PositionCardProps) => {
    const { pool } = selectedPosition?.pool || {};

    // hack
    const token0 = useCurrency(pool?.token0?.wrapped.address as Address, true);
    const token1 = useCurrency(pool?.token1?.wrapped.address as Address, true);

    const positionInFarming = usePositionInFarming(selectedPosition?.id);

    const activeFarming = farming?.farming;
    const endedFarming = closedFarmings?.find((closedFarming) => closedFarming.id === positionInFarming?.eternalFarming);

    const position = selectedPosition?.position;

    const mintInfo = useDerivedMintInfo(token0, token1, selectedPosition?.pool.id, pool?.fee || INITIAL_POOL_FEE, token0, position);

    const { data: positionAnalytics, refetch: refetchAnalytics } = usePositionAnalytics(selectedPosition?.id || "", position);

    // Refetch callback for use by child components
    const handleRefetch = useCallback(async () => {
        await refetch();
        await refetchAnalytics();
    }, [refetch, refetchAnalytics]);

    if (!selectedPosition) return null;

    const hasLiquidity = position && Number(position.liquidity) > 0;

    const handleClose = () => {
        onClose?.();
    };

    return (
        <Dialog open={!!selectedPosition} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent
                size="xl"
                className="max-h-[94vh] overflow-hidden border border-border bg-card p-0 gap-0 shadow-sm md:max-w-[900px]"
            >
                <div className="border-b border-border p-4">
                    <PositionModalHeader
                        token0={token0}
                        token1={token1}
                        positionId={selectedPosition.id}
                        poolFee={pool?.fee || 0}
                        status={selectedPosition.status}
                        onClose={onClose}
                    />
                </div>

                <div className="max-h-[calc(94vh-92px)] overflow-y-auto p-4">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
                        <div className="flex flex-col gap-3">
                            <MetrcisSection token0={token0} token1={token1} positionAnalytics={positionAnalytics} />

                            <DepositSection mintInfo={mintInfo} position={position} token0={token0} token1={token1} />

                            <FeesSection pool={pool} positionId={Number(selectedPosition.id)} onRefetch={handleRefetch} />

                            {positionInFarming && activeFarming && !endedFarming && (
                                <HarvestAndExitFarmingCard
                                    eternalFarming={activeFarming}
                                    selectedPosition={positionInFarming as Deposit}
                                    isEnded={false}
                                />
                            )}

                            {positionInFarming && endedFarming && (
                                <HarvestAndExitFarmingCard
                                    eternalFarming={endedFarming}
                                    selectedPosition={positionInFarming as Deposit}
                                    isEnded
                                />
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <ChartSection mintInfo={mintInfo} position={position} />

                            <ManageSection
                                positionId={Number(selectedPosition.id)}
                                currencyA={token0}
                                currencyB={token1}
                                mintInfo={mintInfo}
                                hasLiquidity={!!hasLiquidity}
                                onRefetch={handleRefetch}
                                poolAddress={selectedPosition.pool.id}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PositionManagerModal;
