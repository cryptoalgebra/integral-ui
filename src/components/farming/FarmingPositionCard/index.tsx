import { Deposit } from '@/graphql/generated/graphql';
import { cn } from '@/lib/utils';

interface FarmingPositionCardProps {
    position: Deposit;
    status: string;
    className?: string;
    onClick?: () => void;
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
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                    background:
                        'linear-gradient(181.1deg, #686EFF 0.93%, #141520 99.07%)',
                }}
            >
                {position.id}
            </div>
            <div className="flex flex-col">
                <p>Position #{position.id}</p>
                <div>
                    <div
                        className={cn(
                            'flex gap-2 items-center',
                            status === 'In range'
                                ? 'text-green-300'
                                : 'text-red-300'
                        )}
                    >
                        <div
                            className={cn(
                                'w-2 h-2 rounded-full',
                                status === 'In range'
                                    ? 'bg-green-300'
                                    : 'bg-red-300'
                            )}
                        ></div>
                        <p className="text-sm">{status}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmingPositionCard;
