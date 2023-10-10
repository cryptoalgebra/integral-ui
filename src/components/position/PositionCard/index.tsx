import { usePool } from "@/hooks/pools/usePool";
import { usePosition } from "@/hooks/positions/usePositions";
import { Position } from "@cryptoalgebra/integral-sdk";
import PositionNFT from "../PositionNFT";
import { Button } from "@/components/ui/button";
import { FormattedPosition } from "@/types/formatted-position";
import { formatUSD } from "@/utils/common/formatUSD";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercent } from "@/utils/common/formatPercent";
import PositionRangeChart from "../PositionRangeChart";
import { BarChartBigIcon } from "lucide-react";

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

    const [positionLiquidityUSD, _, positionAPR] = selectedPosition ? [
        formatUSD.format(selectedPosition.liquidityUSD),
        formatUSD.format(selectedPosition.feesUSD),
        formatPercent.format(selectedPosition.apr)
    ] : []

    if (!selectedPosition || loading) return <div>Skeleton</div>

    return <div className="flex flex-col gap-6">
        <div className="relative flex w-full justify-end text-right">
            <div className="absolute left-2 top-2">
                <PositionNFT positionId={selectedPosition.id} />
            </div>
            <div className="flex flex-col gap-2 w-[235px]">
                <h2 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-2xl">Position #1</h2>
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
                    {/* {positionFeesUSD ? `Fees ${positionFeesUSD}` : <Skeleton className="w-[100px] h-[30px]" />} */}
                    {/* { positionAPR ? `APR ${positionAPR}` : <Skeleton className="w-[100px] h-[30px]" /> } */}
                </div>
            </div>
        </div>
        <Button>Add liquidity</Button>
        <div className="flex w-full justify-between">
            <div className="text-left">
                <div className="font-bold text-sm">EARNED FEES</div>
                <div className="font-semibold text-2xl">
                    {positionLiquidityUSD ? <span className="text-cyan-300 drop-shadow-cyan">{positionLiquidityUSD}</span> : <Skeleton className="w-[100px] h-[30px]" />}
                </div>
            </div>
            <Button>Collect</Button>
        </div>
        <div className="flex w-full h-[35px] bg-red-500 rounded-xl">
            
        </div>
        <div className="flex gap-2">
            {
                ['Info', 'Range'].map(v => <div key={v} className="py-2 px-4 bg-card border border-card-border rounded-2xl">{v}</div>)
            }
            <Button variant={'icon'} size={'icon'}>
                <BarChartBigIcon  />
            </Button>
        </div>

        {
            pool && positionEntity &&
            <PositionRangeChart pool={pool} position={positionEntity} />
        }
    </div>

}

export default PositionCard