import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Deposit } from "@/graphql/generated/graphql";
import { cn } from "@/utils/common/cn";
import { FormattedPosition } from "@/types/formatted-position";
import { useState } from "react";
import { Farming } from "@/types/farming-info";
import { useFarmCheckApprove } from "../../hooks/useFarmCheckApprove";
import { useFarmApprove } from "../../hooks/useFarmApprove";
import { useFarmStake } from "../../hooks/useFarmStake";
import { FarmingPositionCard } from "..";
import { Address } from "viem";

import ALMModule from "@/modules/ALMModule";
const { useALMFarmStake, useALMFarmApprove } = ALMModule.hooks;

interface SelectPositionFarmModalProps {
    positions: Deposit[];
    farming: Farming;
    positionsData: FormattedPosition[];
    isHarvestLoading: boolean;
}

export function SelectPositionFarmModal({ farming, positionsData, isHarvestLoading }: SelectPositionFarmModalProps) {
    const [selectedPosition, setSelectedPosition] = useState<FormattedPosition>();
    const tokenId = selectedPosition && !selectedPosition.isALM ? BigInt(selectedPosition.id) : 0n;

    const { approved, isLoading: isApproveVerifying } = useFarmCheckApprove(tokenId);

    const { isLoading: isApproveLoading, onApprove } = useFarmApprove(tokenId);

    const { isLoading: isStakeLoading, onStake } = useFarmStake({
        tokenId,
        rewardToken: farming.farming.rewardToken as Address,
        bonusRewardToken: farming.farming.bonusRewardToken as Address,
        pool: farming.farming.pool as Address,
        nonce: BigInt(farming.farming.nonce),
    });

    const { isLoading: isALMApproveLoading, onApprove: onApproveALM, isSuccess: isALMApproved } = useALMFarmApprove(selectedPosition);
    const { isLoading: isStakeALMLoading, onStake: onStakeALM } = useALMFarmStake(selectedPosition);

    const isApproving = isApproveVerifying || isApproveLoading || isALMApproveLoading;
    const isApproved = approved || isALMApproved;
    const isStaking = isStakeLoading || isStakeALMLoading;

    const availablePositions = positionsData.filter(
        (position) =>
            !position.onFarming && (Number(position.almShares || 0) > 0 || BigInt(position.position?.liquidity.toString() || 0) > 0n)
    );

    const handleApprove = async () => {
        if (isApproved) return;
        if (isApproveLoading || isStakeLoading) return;
        if (selectedPosition?.isALM) {
            onApproveALM?.();
        } else {
            onApprove?.();
        }
    };

    const handleStake = async () => {
        if (!isApproved) return;
        if (isStakeLoading || isApproveLoading) return;
        if (selectedPosition?.isALM) {
            onStakeALM?.();
        } else {
            onStake?.();
        }
    };

    const handleSelectPosition = (position: FormattedPosition) => {
        if (isStakeLoading || isApproveLoading || isApproving) return;
        setSelectedPosition(position);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'primary'} disabled={isHarvestLoading} className="whitespace-nowrap w-1/2">
                    Deposit
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] rounded-xl! bg-card">
                <DialogHeader>
                    <DialogTitle className="font-bold select-none my-2 max-md:mx-auto">Select Position</DialogTitle>
                </DialogHeader>
                <div className="py-1">
                    <ul className="grid grid-cols-2 max-md:grid-cols-1 max-h-[300px] gap-3 overflow-auto">
                        {availablePositions.length > 0 ? (
                            availablePositions.map((position) => {
                                const isDepositEligible = position.rangeLength >= Number(farming.farming.minRangeLength);

                                return (
                                    <FarmingPositionCard
                                        key={position.id}
                                        className={cn(
                                            "w-full row-span-1 col-span-1",
                                            selectedPosition?.id === position.id ? "border-primary-button hover:border-primary-button" : ""
                                        )}
                                        onClick={() => handleSelectPosition(position)}
                                        positionId={position.id}
                                        isDepositEligible={isDepositEligible}
                                        status={position.outOfRange ? "Out of range" : "In range"}
                                        isALM={position.isALM}
                                    />
                                );
                            })
                        ) : (
                            <h3 className="mx-auto col-span-2">You don't have available positions for this pool</h3>
                        )}
                    </ul>
                </div>
                <div className="w-full flex gap-3 mt-2">
                    {isApproveVerifying ? (
                        <Button variant={'primary'} disabled className="w-full">
                            Checking Approval...
                        </Button>
                    ) : selectedPosition && availablePositions.length > 0 ? (
                        <>
                            <Button variant={'primary'} disabled={isApproved || isApproving} className="w-1/2" onClick={handleApprove}>
                                {isApproved ? <span>1. Approved</span> : isApproving ? <Loader /> : <span>1. Approve</span>}
                            </Button>
                            <Button variant={'primary'} disabled={!isApproved || isStaking} className="w-1/2" onClick={handleStake}>
                                {isStaking ? <Loader /> : "2. Deposit"}
                            </Button>
                        </>
                    ) : (
                        <Button variant={'primary'} disabled className="w-full">
                            Select Position
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
