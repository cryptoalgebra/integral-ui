import { usePool } from "@/hooks/pools/usePool";
import { usePosition } from "@/hooks/positions/usePositions";
import { INITIAL_POOL_FEE, Position } from "@cryptoalgebra/integral-sdk";
import PositionNFT from "../PositionNFT";
import { FormattedPosition } from "@/types/formatted-position";
import { formatUSD } from "@/utils/common/formatUSD";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent } from "@/utils/common/formatPercent";
import PositionRangeChart from "../PositionRangeChart";
import TokenRatio from "@/components/create-position/TokenRatio";
import { useDerivedMintInfo } from "@/state/mintStore";
import CollectFees from "../CollectFees";

interface PositionCardProps {
    selectedPosition: FormattedPosition | undefined
}

const PositionCard = ({ selectedPosition }: PositionCardProps) => {

    const { loading, position } = usePosition(selectedPosition?.id)

    const [, pool] = usePool(position?.pool)

    const positionEntity = pool && position && new Position({
        pool,
        liquidity: position.liquidity.toString(),
        tickLower: Number(position.tickLower),
        tickUpper: Number(position.tickUpper)
    })

    const mintInfo = useDerivedMintInfo(
        positionEntity?.amount0.currency,
        positionEntity?.amount1.currency,
        position?.pool,
        INITIAL_POOL_FEE,
        positionEntity?.amount0.currency,
        positionEntity || undefined
    )

    const [positionLiquidityUSD, positionFeesUSD, positionAPR] = selectedPosition ? [
        formatUSD.format(selectedPosition.liquidityUSD),
        formatUSD.format(selectedPosition.feesUSD),
        formatPercent.format(selectedPosition.apr)
    ] : []

    if (!selectedPosition || loading) return

    return <div className="flex flex-col gap-6 bg-card border border-card-border rounded-3xl py-4 px-6 animate-fade-in">
        <div className="relative flex w-full justify-end text-right">
            <div className="absolute left-2 top-2">
                <PositionNFT positionId={selectedPosition.id} />
            </div>
            <div className="flex flex-col gap-2 w-[235px]">
                <h2 className="scroll-m-20 text-2xl font-bold tracking-tight lg:text-2xl">{`Position #${selectedPosition?.id}`}</h2>
                <div className="flex flex-col gap-2">
                    <div>
                        <div className="font-bold text-sm">LIQUIDITY</div>
                        <div className="font-semibold text-2xl">
                            {positionLiquidityUSD ? <span className="text-cyan-300 drop-shadow-cyan">{positionLiquidityUSD}</span> : <Skeleton className="w-[100px] h-[30px]" />}
                        </div>
                    </div>
                    <div>
                        <div className="font-bold text-sm">APR</div>
                        <div className="font-semibold text-2xl">
                            {positionAPR ? <span className="text-fuchsia-400 drop-shadow-pink">{positionAPR}</span> : <Skeleton className="w-[100px] h-[30px]" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
       <CollectFees positionFeesUSD={positionFeesUSD} mintInfo={mintInfo} positionId={selectedPosition.id} />
        <TokenRatio mintInfo={mintInfo} />
        {
            pool && positionEntity &&
            <PositionRangeChart pool={pool} position={positionEntity} />
        }
    </div>

}

export default PositionCard