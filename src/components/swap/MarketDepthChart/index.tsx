import LiquidityChart from "@/components/create-position/LiquidityChart";
import { usePool } from "@/hooks/pools/usePool";
import { Currency, tickToPrice } from "@cryptoalgebra/integral-sdk"
import { Address } from "wagmi";

interface MarketDepthChartProps {
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    poolAddress: Address | undefined;
}

const MarketDepthChart = ({ currencyA, currencyB, poolAddress }: MarketDepthChartProps) => {

    const [, pool] = usePool(poolAddress)

    const price = pool && tickToPrice(pool.token0, pool.token1, pool.tickCurrent)

    return <div className="w-[500px] h-full bg-card fixed border-l border-card-border right-0 top-0">
        <div>Market depth</div>

        <div className="h-[600px]">
        <LiquidityChart 
            currencyA={currencyA} 
            currencyB={currencyB} 
            currentPrice={price ? parseFloat(price.toSignificant()) : undefined} 
            priceLower={price || undefined} 
            priceUpper={price || undefined} 
            />
            </div>
    </div>

}

export default MarketDepthChart