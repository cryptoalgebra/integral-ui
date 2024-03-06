import Loader from '@/components/common/Loader';
import FarmingPositionCard from '@/components/farming/FarmingPositionCard';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Deposit } from '@/graphql/generated/graphql';
import useFarmIntegralActions from '@/hooks/farming/useFarmIntegralActions';
import { useFarmIntegralApprove } from '@/hooks/farming/useFarmIntegralApprove';
import { cn } from '@/lib/utils';
import { Farming } from '@/types/farming-info';
import { useState } from 'react';

interface SelectPositionFarmModalProps {
    positions: Deposit[];
    farming: Farming;
}

export function SelectPositionFarmModal({
    positions,
    farming,
}: SelectPositionFarmModalProps) {
    const [selectedPosition, setSelectedPosition] = useState<Deposit>();
    const tokenId = selectedPosition ? BigInt(selectedPosition.id) : 0n;

    const { onApprove, onStake } = useFarmIntegralActions({
        tokenId,
        rewardToken: farming.farming.rewardToken,
        bonusRewardToken: farming.farming.bonusRewardToken,
        pool: farming.farming.pool,
        nonce: farming.farming.nonce,
    });

    const { approved, isLoading } = useFarmIntegralApprove(tokenId);

    const handleApprove = async () => {
        if (approved) return;
        onApprove();
    };

    const handleStake = async () => {
        if (!approved) return;
        onStake();
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="whitespace-nowrap w-1/2">Deposit</Button>
            </DialogTrigger>
            <DialogContent
                className="min-w-[500px] rounded-3xl bg-card"
                style={{ borderRadius: '32px' }}
            >
                <DialogHeader>
                    <DialogTitle className="font-bold select-none">
                        Select Position
                    </DialogTitle>
                </DialogHeader>

                <ul className="grid grid-cols-2 gap-4">
                    {positions &&
                        positions.map((position) => {
                            if (position.eternalFarming !== null) return;
                            return (
                                <FarmingPositionCard
                                    key={position.id}
                                    className={cn(
                                        'w-full row-span-1 col-span-1',
                                        selectedPosition?.id === position.id
                                            ? 'border-primary-button hover:border-primary-button'
                                            : ''
                                    )}
                                    onClick={() =>
                                        setSelectedPosition(position)
                                    }
                                    position={position}
                                    status="In range"
                                />
                            );
                        })}
                </ul>
                <div className="w-full flex gap-4">
                    {isLoading ? (
                        <Button disabled className="w-full">
                            Checking Approval...
                        </Button>
                    ) : selectedPosition ? (
                        <>
                            <Button
                                disabled={approved}
                                className="w-1/2"
                                onClick={handleApprove}
                            >
                                {approved ? (
                                    <span>1. Approved</span>
                                ) : (
                                    <span>1. Approve</span>
                                )}
                            </Button>
                            <Button
                                disabled={!approved}
                                className="w-1/2"
                                onClick={handleStake}
                            >
                                2. Deposit
                            </Button>
                        </>
                    ) : (
                        <Button disabled className="w-full">
                            Select Position
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
