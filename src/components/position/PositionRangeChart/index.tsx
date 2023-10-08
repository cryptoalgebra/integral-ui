import LiquidityChart from "@/components/create-position/LiquidityChart"
import { Card } from "@/components/ui/card";
import { Pool, Position, tickToPrice } from "@cryptoalgebra/integral-sdk"

interface PositionRangeChartProps {
    pool: Pool;
    position: Position
}

const PositionRangeChart = ({ pool, position }: PositionRangeChartProps) => {

    const price = pool && tickToPrice(pool.token0, pool.token1, pool.tickCurrent).toSignificant()

    console.log('token0PriceLower', position.token0PriceLower.toSignificant(), position.token0PriceUpper.toSignificant())

    return  <LiquidityChart currencyA={pool.token0} currencyB={pool.token1} currentPrice={price ? parseFloat(price) : undefined}
        priceLower={position.token0PriceLower}
        priceUpper={position.token0PriceUpper} />

}

export default PositionRangeChart