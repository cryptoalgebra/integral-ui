import React from 'react';
import { Deposit } from '@/graphql/generated/graphql';
import { cn } from '@/lib/utils';

interface FarmingPositionCardProps {
    position: Deposit;
    status: string;
    className: string;
    onClick: () => void;
}

const FarmingPositionCard = ({
    position,
    status,
    className,
    onClick,
}: FarmingPositionCardProps) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                'w-fit p-4 cursor-pointer flex gap-4 bg-card-dark rounded-3xl border border-border/60 hover:border-border transition-all ease-in-out duration-200',
                className
            )}
        >
            <div className="w-12 h-12 rounded-full bg-green-300 flex items-center justify-center">
                {position.id}
            </div>
            <div className="flex flex-col">
                <p>Position #{position.id}</p>
                <p>{status}</p>
            </div>
        </div>
    );
};

export default FarmingPositionCard;
