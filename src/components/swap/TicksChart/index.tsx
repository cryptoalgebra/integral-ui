import LiquidityChart from "@/components/create-position/LiquidityChart"
import { useDerivedMintInfo } from "@/state/mintStore";
import { Currency, INITIAL_POOL_FEE } from "@cryptoalgebra/integral-sdk"
import { Address } from "viem";

interface TicksChartProps {
    currencyA: Currency;
    currencyB: Currency;
    poolAddress: Address;
}

const TicksChart = ({ currencyA, currencyB, poolAddress}: TicksChartProps) => {

    const mintInfo = useDerivedMintInfo(
        currencyA,
        currencyB,
        poolAddress,
        INITIAL_POOL_FEE,
        currencyA,
        undefined
    )

    return  <LiquidityChart currencyA={currencyA} currencyB={currencyB} currentPrice={undefined} priceLower={mintInfo.lowerPrice} priceUpper={mintInfo.upperPrice} />
}

export default TicksChart