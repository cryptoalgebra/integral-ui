import { INITIAL_POOL_FEE, Pool } from "@cryptoalgebra/custom-pools-sdk";
import PositionNFT from "../PositionNFT";
import { FormattedPosition } from "@/types/formatted-position";
import { Skeleton } from "@/components/ui/skeleton";
import PositionRangeChart from "../PositionRangeChart";
import TokenRatio from "@/components/create-position/TokenRatio";
import { useDerivedMintInfo } from "@/state/mintStore";
import CollectFees from "../CollectFees";
import RemoveLiquidityModal from "@/components/modals/RemoveLiquidityModal";
import { Deposit, EternalFarming } from "@/graphql/generated/graphql";
import { IncreaseLiquidityModal } from "@/components/modals/IncreaseLiquidityModal";
import { formatAmount } from "@/utils/common/formatAmount";
import FarmingModule from "@/modules/FarmingModule";
import { Farming } from "@/types/farming-info";
import { useParams } from "react-router-dom";
import { Address } from "viem";
import { useCurrency } from "@/hooks/common/useCurrency";
const { HarvestAndExitFarmingCard } = FarmingModule.components;
const { usePositionInFarming } = FarmingModule.hooks;

interface PositionCardProps {
    pool: Pool | null;
    selectedPosition: FormattedPosition | undefined;
    farming?: Farming | null;
    closedFarmings?: EternalFarming[] | null;
}

const PositionCard = ({ pool, selectedPosition, farming, closedFarmings }: PositionCardProps) => {
    const { pool: poolId } = useParams() as { pool: Address };
    const positionInFarming = usePositionInFarming(selectedPosition?.id);

    const activeFarming = farming?.farming;
    const endedFarming = closedFarmings?.find((closedFarming) => closedFarming.id === positionInFarming?.eternalFarming);

    const position = selectedPosition?.position;

    const currencyA = useCurrency(pool?.token0?.address as Address, true);
    const currencyB = useCurrency(pool?.token1?.address as Address, true);

    const mintInfo = useDerivedMintInfo(currencyA, currencyB, poolId, INITIAL_POOL_FEE, currencyA, position || undefined);

    const [positionLiquidityUSD, positionFeesUSD, positionAPR] = selectedPosition
        ? [
              `$${formatAmount(selectedPosition.liquidityUSD, 2)}`,
              `$${formatAmount(Number(selectedPosition.feesUSD), 2)}`,
              `${formatAmount(selectedPosition.apr, 2)}%`,
          ]
        : [];

    if (!selectedPosition) return;

    return (
        <div className="flex flex-col gap-6 bg-card border border-card-border rounded-xl p-4 animate-fade-in">
            <div className="relative flex w-full justify-end text-right">
                <div className="absolute left-0 top-0">
                    <PositionNFT positionId={Number(selectedPosition.id)} />
                </div>
                <div className="flex flex-col gap-4 w-full">
                    <h2 className="scroll-m-20 text-2xl font-bold tracking-tight lg:text-2xl">{`Position #${selectedPosition?.id}`}</h2>
                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="font-bold text-xs">LIQUIDITY</div>
                            <div className="font-semibold text-2xl">
                                {positionLiquidityUSD ? (
                                    <span className="text-cyan-300 drop-shadow-cyan">{positionLiquidityUSD}</span>
                                ) : (
                                    <Skeleton className="w-[100px] h-[30px]" />
                                )}
                            </div>
                        </div>
                        <div>
                            <div className="font-bold text-xs">APR</div>
                            <div className="font-semibold text-2xl">
                                {positionAPR ? (
                                    <span className="text-fuchsia-400 drop-shadow-pink">{positionAPR}</span>
                                ) : (
                                    <Skeleton className="w-[100px] h-[30px]" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CollectFees positionFeesUSD={positionFeesUSD} mintInfo={mintInfo} positionId={Number(selectedPosition.id)} />
            <TokenRatio mintInfo={mintInfo} />

            {position && (
                <div className="flex justify-between font-semibold">
                    <div>{`${formatAmount(position.amount0.toSignificant(24), 6)} ${currencyA?.symbol}`}</div>
                    <div>{`${formatAmount(position.amount1.toSignificant(24), 6)} ${currencyB?.symbol}`}</div>
                </div>
            )}
            {pool && position && <PositionRangeChart pool={pool} position={position} />}

            {position && (
                <div className="flex gap-4 w-full whitespace-nowrap">
                    <IncreaseLiquidityModal
                        tokenId={Number(Number(selectedPosition.id))}
                        currencyA={currencyA}
                        currencyB={currencyB}
                        mintInfo={mintInfo}
                    />
                </div>
            )}
            {position && Number(position.liquidity) > 0 && (
                <div className="flex gap-4 w-full whitespace-nowrap">
                    <RemoveLiquidityModal positionId={Number(selectedPosition.id)} />
                </div>
            )}
            {positionInFarming && activeFarming && !endedFarming && (
                <HarvestAndExitFarmingCard eternalFarming={activeFarming} selectedPosition={positionInFarming as Deposit} isEnded={false} />
            )}
            {positionInFarming && endedFarming && (
                <HarvestAndExitFarmingCard eternalFarming={endedFarming} selectedPosition={positionInFarming as Deposit} isEnded />
            )}
        </div>
    );
};

export default PositionCard;
