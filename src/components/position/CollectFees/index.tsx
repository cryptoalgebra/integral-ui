import CurrencyLogo from "@/components/common/CurrencyLogo";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePositionFees } from "@/hooks/positions/usePositionFees";
import { IDerivedMintInfo } from "@/state/mintStore";
import { formatAmount } from "@/utils";
import CollectFeesModal from "@/components/modals/CollectFeesModal";

interface CollectFeesProps {
    mintInfo: IDerivedMintInfo;
    positionFeesUSD: string | undefined;
    positionId: number;
}

const CollectFees = ({ mintInfo, positionFeesUSD, positionId }: CollectFeesProps) => {
    const pool = mintInfo.pool;

    const { amount0, amount1, amount0Usd, amount1Usd } = usePositionFees(pool ?? undefined, positionId, true);

    return (
        <div className="relative flex w-full items-center justify-between">
            <div className="text-left">
                <div className="font-bold text-xs text-text-100/75 mb-2">EARNED FEES</div>
                {positionFeesUSD ? (
                    <HoverCard closeDelay={0} openDelay={0}>
                        <HoverCardTrigger>
                            <span className="text-cyan-300  font-semibold text-2xl drop-shadow-cyan border-b border-dotted border-cyan-300 cursor-pointer">
                                {positionFeesUSD}
                            </span>
                        </HoverCardTrigger>
                        <HoverCardContent side="bottom" className="flex flex-col gap-2 p-4">
                            <h4>Tokens</h4>
                            <div className="flex flex-col p-2 gap-2 bg-card-dark rounded-lg">
                                <div className="flex items-center gap-6 justify-between">
                                    <div className="flex gap-2 items-center">
                                        <CurrencyLogo className="inline" currency={amount0?.currency} size={20} />
                                        <span>{amount0?.currency?.symbol}</span>
                                    </div>

                                    <div className="flex gap-1 items-end">
                                        <span>{formatAmount(amount0?.toExact() || 0, 6)}</span>
                                        <span className="opacity-50 text-sm">(${formatAmount(amount0Usd || 0, 2)})</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 justify-between">
                                    <div className="flex gap-2 items-center">
                                        <CurrencyLogo className="inline" currency={amount1?.currency} size={20} />
                                        <span>{amount1?.currency?.symbol}</span>
                                    </div>

                                    <div className="flex gap-1 items-end">
                                        <span>{formatAmount(amount1?.toExact() || 0, 6)}</span>
                                        <span className="opacity-50 text-sm">(${formatAmount(amount1Usd || 0, 2)})</span>
                                    </div>
                                </div>
                            </div>
                        </HoverCardContent>
                    </HoverCard>
                ) : (
                    <Skeleton className="w-[100px] h-[30px]" />
                )}
            </div>

            <CollectFeesModal
                mintInfo={mintInfo}
                positionId={positionId}
                amount0={amount0}
                amount1={amount1}
                amount0Usd={amount0Usd}
                amount1Usd={amount1Usd}
            />
        </div>
    );
};

export default CollectFees;
