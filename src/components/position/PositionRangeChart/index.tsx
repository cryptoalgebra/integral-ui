import LiquidityChart from "@/components/create-position/LiquidityChart";
import { Pool, Position, tickToPrice } from "@cryptoalgebra/custom-pools-sdk";

interface PositionRangeChartProps {
    pool: Pool;
    position: Position;
}

const PositionRangeChart = ({ pool, position }: PositionRangeChartProps) => {
    const price = pool && tickToPrice(pool.token0, pool.token1, pool.tickCurrent).toSignificant();

    return (
        <LiquidityChart
            pool={pool}
            currencyA={pool.token0}
            currencyB={pool.token1}
            currentPrice={price ? parseFloat(price) : undefined}
            priceLower={position.token0PriceLower}
            priceUpper={position.token0PriceUpper}
        />
    );
};

export default PositionRangeChart;
