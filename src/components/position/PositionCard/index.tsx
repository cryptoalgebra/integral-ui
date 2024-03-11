import { usePool } from '@/hooks/pools/usePool';
import {
    usePosition,
    usePositionInFarming,
} from '@/hooks/positions/usePositions';
import {
    ADDRESS_ZERO,
    INITIAL_POOL_FEE,
    Position,
} from '@cryptoalgebra/integral-sdk';
import PositionNFT from '../PositionNFT';
import { FormattedPosition } from '@/types/formatted-position';
import { formatUSD } from '@/utils/common/formatUSD';
import { Skeleton } from '@/components/ui/skeleton';
import PositionRangeChart from '../PositionRangeChart';
import TokenRatio from '@/components/create-position/TokenRatio';
import { useDerivedMintInfo } from '@/state/mintStore';
import CollectFees from '../CollectFees';
import RemoveLiquidityModal from '@/components/modals/RemoveLiquidityModal';
import { Button } from '@/components/ui/button';
import { useFarmUnstake } from '@/hooks/farming/useFarmStake';
import { useAccount } from 'wagmi';
import Loader from '@/components/common/Loader';
import { Farming } from '@/types/farming-info';
import { useFarmHarvest } from '@/hooks/farming/useFarmHarvest';

interface PositionCardProps {
    selectedPosition: FormattedPosition | undefined;
    farming: Farming;
}

const PositionCard = ({ selectedPosition, farming }: PositionCardProps) => {
    const { loading, position } = usePosition(selectedPosition?.id);

    const { address: account } = useAccount();

    const positionInFarming = usePositionInFarming(selectedPosition?.id);

    const { onHarvest, isLoading: isHarvesting } = useFarmHarvest({
        tokenId: positionInFarming ? BigInt(positionInFarming?.id) : 0n,
        rewardToken: farming.farming.rewardToken,
        bonusRewardToken: farming.farming.bonusRewardToken,
        pool: farming.farming.pool,
        nonce: farming.farming.nonce,
        account: account ?? ADDRESS_ZERO,
    });

    const { onUnstake, isLoading: isUnstaking } = useFarmUnstake({
        tokenId: positionInFarming ? BigInt(positionInFarming?.id) : 0n,
        rewardToken: farming.farming.rewardToken,
        bonusRewardToken: farming.farming.bonusRewardToken,
        pool: farming.farming.pool,
        nonce: farming.farming.nonce,
        account: account ?? ADDRESS_ZERO,
    });

    const handleUnstake = async () => {
        if (!positionInFarming) return;
        if (!onUnstake) return;
        onUnstake();
    };

    const handleHarvest = async () => {
        if (!positionInFarming) return;
        if (!onHarvest) return;
        onHarvest();
    };

    const [, pool] = usePool(position?.pool);
    const positionEntity =
        pool &&
        position &&
        new Position({
            pool,
            liquidity: position.liquidity.toString(),
            tickLower: Number(position.tickLower),
            tickUpper: Number(position.tickUpper),
        });

    const mintInfo = useDerivedMintInfo(
        positionEntity?.amount0.currency,
        positionEntity?.amount1.currency,
        position?.pool,
        INITIAL_POOL_FEE,
        positionEntity?.amount0.currency,
        positionEntity || undefined
    );

    const [positionLiquidityUSD, positionFeesUSD, positionAPR] =
        selectedPosition
            ? [
                  formatUSD.format(selectedPosition.liquidityUSD),
                  formatUSD.format(selectedPosition.feesUSD),
                  `${selectedPosition.apr.toFixed(2)}%`,
              ]
            : [];

    if (!selectedPosition || loading) return;

    return (
        <div className="flex flex-col gap-6 bg-card border border-card-border rounded-3xl p-4 animate-fade-in">
            <div className="relative flex w-full justify-end text-right">
                <div className="absolute left-0 top-0">
                    <PositionNFT positionId={selectedPosition.id} />
                </div>
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="scroll-m-20 text-2xl font-bold tracking-tight lg:text-2xl">{`Position #${selectedPosition?.id}`}</h2>
                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="font-bold text-xs">LIQUIDITY</div>
                            <div className="font-semibold text-2xl">
                                {positionLiquidityUSD ? (
                                    <span className="text-cyan-300 drop-shadow-cyan">
                                        {positionLiquidityUSD}
                                    </span>
                                ) : (
                                    <Skeleton className="w-[100px] h-[30px]" />
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-xs">APR</div>
                            <div className="font-semibold text-2xl">
                                {positionAPR ? (
                                    <span className="text-fuchsia-400 drop-shadow-pink">
                                        {positionAPR}
                                    </span>
                                ) : (
                                    <Skeleton className="w-[100px] h-[30px]" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CollectFees
                positionFeesUSD={positionFeesUSD}
                mintInfo={mintInfo}
                positionId={selectedPosition.id}
            />
            <TokenRatio mintInfo={mintInfo} />

            {positionEntity && (
                <div className="flex justify-between font-semibold">
                    <div>
                        {`${positionEntity.amount0.toFixed(2)} ${
                            positionEntity.amount0.currency.symbol
                        }`}
                    </div>
                    <div>
                        {`${positionEntity.amount1.toFixed(2)} ${
                            positionEntity.amount1.currency.symbol
                        }`}
                    </div>
                </div>
            )}
            {pool && positionEntity && (
                <PositionRangeChart pool={pool} position={positionEntity} />
            )}
            <div className="flex gap-4 w-full whitespace-nowrap">
                <RemoveLiquidityModal positionId={selectedPosition.id} />
            </div>
            {positionInFarming && (
                <div className="flex flex-col gap-6">
                    <Button onClick={handleHarvest} disabled={isHarvesting}>
                        {isHarvesting ? <Loader /> : 'Harvest rewards'}
                    </Button>
                    <Button onClick={handleUnstake} disabled={isUnstaking}>
                        {isUnstaking ? <Loader /> : 'Exit from farming'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PositionCard;
