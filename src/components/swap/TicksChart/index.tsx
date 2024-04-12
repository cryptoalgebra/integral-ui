import LiquidityChart from "@/components/create-position/LiquidityChart"
import { Currency } from "@cryptoalgebra/integral-sdk"

interface TicksChartProps {
    currencyA: Currency;
    currencyB: Currency;
}

const TicksChart = ({ currencyA, currencyB }: TicksChartProps) => {
    return <div className="w-full mt-12">
        <LiquidityChart currencyA={currencyA} currencyB={currencyB} />
    </div>
}

export default TicksChart