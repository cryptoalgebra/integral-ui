import PageContainer from "@/components/common/PageContainer"
import PageTitle from "@/components/common/PageTitle"
import MyPositions from "@/components/pool/MyPositions"
import PositionLiquidity from "@/components/position/PositionLiquidity"
import PositionNFT from "@/components/position/PositionNFT"
import { Button } from "@/components/ui/button"
import { usePoolFeeDataQuery, useSinglePoolQuery } from "@/graphql/generated/graphql"
import { usePool } from "@/hooks/pools/usePool"
import { usePositions } from "@/hooks/positions/usePositions"
import { getPositionAPR } from "@/utils/positions/getPositionAPR"
import { getPositionFees } from "@/utils/positions/getPositionFees"
import { Position } from "@cryptoalgebra/integral-sdk"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { Address } from "viem"

const PoolPage = () => {

    const { pool: poolId } = useParams() as { pool: Address }

    const [, poolEntity] = usePool(poolId)

    const { data: poolInfo } = useSinglePoolQuery({
        variables: {
            poolId
        }
    })

    const { data: poolFeeData } = usePoolFeeDataQuery({
        variables: {
            poolId
        }
    })

    const [positionsFees, setPositionsFees] = useState<any>()
    const [positionsAPRs, setPositionsAPRs] = useState<any>()

    const [token0, token1] = poolEntity ? [poolEntity.token0, poolEntity.token1] : []

    const poolFee = poolEntity && poolEntity.fee / 10_000

    const {  positions } = usePositions()

    const filteredPositions = useMemo(() => {

        if (!positions || !poolEntity) return []

        return positions.filter(({ pool }) => pool.toLowerCase() === poolId.toLowerCase()).map(position => ({
            positionId: position.tokenId, position: new Position({
                pool: poolEntity,
                liquidity: position.liquidity.toString(),
                tickLower: Number(position.tickLower),
                tickUpper: Number(position.tickUpper)
            })
        }))

    }, [positions])

    useEffect(() => {

        async function getPositionsFees() {
            const fees = await Promise.all(filteredPositions.map(({ positionId, position }) => getPositionFees(position.pool, positionId)))
            setPositionsFees(fees)
        }

        if (filteredPositions) getPositionsFees()

    }, [filteredPositions])

    useEffect(() => {

        async function getPositionsAPRs() {
            const aprs = await Promise.all(filteredPositions.map(({ position }) => getPositionAPR(poolId, position, poolInfo?.pool, poolFeeData?.poolDayDatas)))
            setPositionsAPRs(aprs)
        }

        if (filteredPositions && poolInfo?.pool && poolFeeData?.poolDayDatas && poolId) getPositionsAPRs()

    }, [filteredPositions, poolInfo, poolId, poolFeeData])

    const formatLiquidityUSD = (position: Position) => {
        if (!poolInfo?.pool) return 0

        const amount0USD = Number(position.amount0.toSignificant()) * Number(poolInfo.pool.token1Price)
        const amount1USD = Number(position.amount1.toSignificant()) * Number(poolInfo.pool.token0Price)

        return amount0USD + amount1USD
    }

    const formatFeesUSD = (idx: number) => {
        if (!positionsFees || !positionsFees[idx] || !poolInfo?.pool) return 0

        const fees0USD = positionsFees[idx][0] ? Number(positionsFees[idx][0].toSignificant()) * Number(poolInfo.pool.token0Price) : 0
        const fees1USD = positionsFees[idx][1] ? Number(positionsFees[idx][1].toSignificant()) * Number(poolInfo.pool.token1Price) : 0

        return fees0USD + fees1USD
    }

    const formatAPR = (idx: number) => {
        if (!positionsAPRs || !positionsAPRs[idx]) return 0
        return positionsAPRs[idx]
    }

    const positionsData = useMemo(() => {

        if (!filteredPositions || !poolEntity) return []

        return filteredPositions.map(({ positionId, position }, idx) => ({
            id: positionId,
            outOfRange: poolEntity.tickCurrent < position.tickLower || poolEntity.tickCurrent > position.tickUpper,
            range: `${position.token0PriceLower.toFixed()} - ${position.token0PriceUpper.toFixed()}`,
            liquidity: formatLiquidityUSD(position),
            fees: formatFeesUSD(idx),
            apr: formatAPR(idx)
        }))

    }, [filteredPositions, poolEntity, poolInfo, positionsFees, positionsAPRs])

    const [myLiquidityUSD, myFeesUSD] = positionsData ? positionsData.reduce((acc, { liquidity, fees }) => [acc[0] + liquidity, acc[1] + fees], [0, 0]) : []

    console.log(myLiquidityUSD, myFeesUSD)

    return <PageContainer>
        <PageTitle>{`${token0?.symbol} / ${token1?.symbol}`}</PageTitle>
        <div>{`${poolFee}%`}</div>

        <h3>My Positions</h3>
        <div className="grid grid-cols-3 gap-8 w-full">
            <div className="col-span-2 bg-card-gradient border border-card-border p-4 rounded-2xl">
                <MyPositions positions={positionsData} poolId={poolId} />
            </div>
            <div className="flex flex-col gap-8 w-full h-full">
                {/* <div className="flex flex-col justify-center flex-1 bg-card-gradient border border-card-border rounded-2xl">
                    <div className="text-[20px] font-bold">My Liquidity</div>
                    <div className="text-[#78FFD7] text-[48px] font-bold drop-shadow-[0_0_5px_rgba(7,142,253,0.8)]">{`$${myLiquidityUSD}`}</div>
                </div>
                <div className="flex flex-col justify-between flex-1 bg-card-gradient border border-card-border p-4 rounded-2xl">
                    <div className="my-auto">
                        <div className="text-[20px] font-bold">Unclaimed Fees</div>
                        <div className="text-[#78FFD7] text-[48px] font-bold drop-shadow-[0_0_5px_rgba(7,142,253,0.8)]">{`$${myFeesUSD}`}</div>
                    </div>
                    <Button>Claim</Button>
                </div> */}
                <div className="flex flex-col gap-8">
                    <div className="flex w-full text-right">
                        <PositionNFT positionId={'1'} />
                        <div className="w-[235px]">
                        <h2 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-2xl">Position #1</h2>
                        <div>Liquidity $20</div>
                        <div>APR 12%</div>
                        <div>Opensea</div>
                        <Button>Manage</Button>
                        </div>
                    </div>
                    <PositionLiquidity />
                    {/* <PositionAPR /> */}
                </div>
            </div>
        </div>
    </PageContainer>

}

export default PoolPage