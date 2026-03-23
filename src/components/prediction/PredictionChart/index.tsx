import { PredictionChart as Chart } from "./prediction-chart";
import { useMarketHourData } from "@/hooks/prediction/useMarketHourData";
import { useState } from "react";
import { IDerivedSwapInfo } from "@/state/swapStore";
import { usePoolMarkets } from "@/hooks/prediction/usePoolMarkets";
import { usePool } from "@/hooks/pools/usePool";
import { useMarketStats } from "@/hooks/prediction/useMarketStats";
import { BarChart, Clock, DollarSign, Users2 } from "lucide-react";

interface IPredicitonChart {
    derivedSwap: IDerivedSwapInfo;
}

export default function PredictionChart({ derivedSwap }: IPredicitonChart) {

    const [, pool] = usePool("0x671ddf7e29272c5bf6996f765fabf58351cff137");

    const { data: marketsForPools } = usePoolMarkets(derivedSwap.poolAddress)

    const [currentMarket, setCurrentMarket] = useState<"greater" | "lower">("greater")

    const lowerMarket = marketsForPools.filter((market) => market.condition === "lower");
    const greaterMarket = marketsForPools.filter((market) => market.condition === "greater");

    const { data: lowerMarketHourData, loading: isLowerMarketDataLoading } = useMarketHourData(lowerMarket[0] ? lowerMarket[0].id : undefined);
    const { data: greaterMarketHourData, loading: isGreaterMarketDataLoading } = useMarketHourData(greaterMarket[0] ? greaterMarket[0].id : undefined);

    const isLoading = isLowerMarketDataLoading || isGreaterMarketDataLoading;

    const market = currentMarket === "lower" ? lowerMarket : greaterMarket;

    const { tvl, volume, users, resolutionDate } = useMarketStats(market[0])

    return <>
        <Chart
            pool={pool}
            lowerMarket={lowerMarket[0]}
            greaterMarket={greaterMarket[0]}
            lowerData={lowerMarketHourData}
            greaterData={greaterMarketHourData}
            currentMarket={currentMarket}
            changeMarket={(type) => setCurrentMarket(type)}
            loading={isLoading}
            showOverlay
        />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-0 mt-6 px-4 text-left text-white/60">
            <div>
                <div className="flex items-center gap-1 mb-1 text-xs font-semibold uppercase">
                    <Clock size={12} />
                    <span>Date</span>
                </div>
                <div>{resolutionDate}</div>
            </div>
            <div>
                <div className="flex items-center gap-1 mb-1 text-xs font-semibold uppercase">
                    <DollarSign size={12} />
                    <span>TVL</span>
                </div>
                <div>{tvl}</div>
            </div>
            <div>
                <div className="flex items-center gap-1 mb-1 text-xs font-semibold uppercase">
                    <BarChart size={12} />
                    <span>Volume</span>
                </div>
                <div>${volume}</div>
            </div>
            <div>
                <div className="flex items-center gap-1 mb-1 text-xs font-semibold uppercase">
                    <Users2 size={12} />
                    <span>Users</span>
                </div>
                <div>{users}</div>
            </div>
        </div>
    </>

}