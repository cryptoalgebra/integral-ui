import PageContainer from "@/components/common/PageContainer"
import PageTitle from "@/components/common/PageTitle"
import RemoveLiquidityModal from "@/components/modals/RemoveLiquidityModal"
import PositionAPR from "@/components/position/PositionAPR"
import PositionLiquidity from "@/components/position/PositionLiquidity"
import PositionNFT from "@/components/position/PositionNFT"
import PositionRangeChart from "@/components/position/PositionRangeChart"
import PositionTokenRatio from "@/components/position/PositionTokenRatio"
import { DEFAULT_CHAIN_ID } from "@/constants/default-chain-id"
import { useAlgebraPositionManagerPositions, useAlgebraPositionManagerTokenUri } from "@/generated"
import { usePool } from "@/hooks/pools/usePool"
import { usePosition } from "@/hooks/positions/usePositions"
import { Position, Token, computePoolAddress } from "@cryptoalgebra/integral-sdk"
import { useParams } from "react-router-dom"

const PositionPage = () => {

    const { position: positionId } = useParams()

    const { loading, position } = usePosition(positionId)

    const [, pool] = usePool(position?.pool)

    const positionEntity = pool && position && new Position({
        pool,
        liquidity: position.liquidity.toString(),
        tickLower: Number(position.tickLower),
        tickUpper: Number(position.tickUpper)
    })

    if (!positionId || loading) return <div>Skeleton</div>

    return <PageContainer>

        <div className="flex justify-between">
            <PageTitle>{`Position #${positionId}`}</PageTitle>
            <RemoveLiquidityModal positionId={positionId} />
        </div>

        <div className="flex flex-col gap-8">
            <div className="mt-8 flex gap-8">
                <PositionNFT positionId={positionId} />
                <PositionLiquidity />
                {/* <PositionAPR /> */}
            </div>
            <div className="flex w-full">
                <div className="w-full h-[200px]">
                    <PositionTokenRatio />
                </div>
            </div>
            <div className="flex w-full">
                <div className="w-full h-[200px] p-4">
                    {
                        pool && positionEntity &&
                        <PositionRangeChart pool={pool} position={positionEntity} />
                    }
                </div>
            </div>
        </div>

    </PageContainer>

}

export default PositionPage