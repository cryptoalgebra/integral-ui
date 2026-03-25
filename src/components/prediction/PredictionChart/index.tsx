import { PredictionChart as Chart } from "./prediction-chart";
import { useMarketFiveMinuteData } from "@/hooks/prediction/useMarketFiveMinuteData";
import { useState } from "react";
import { usePool } from "@/hooks/pools/usePool";
import { useMarketStats } from "@/hooks/prediction/useMarketStats";
import { BarChart, Clock, DollarSign, Users2 } from "lucide-react";
import { PredictionMarket } from "@/types/prediction";

interface IPredicitonChart {
    marketWithToken: PredictionMarket[];
}

export default function PredictionChart({ marketWithToken }: IPredicitonChart) {

    const [, pool] = usePool(marketWithToken[0].pool);

    const [currentMarket, setCurrentMarket] = useState<"greater" | "lower">("greater")

    const market =  marketWithToken.filter((market) => market.condition === "greater");

    const { data: greaterMarketFiveMinuteData, loading: isGreaterMarketDataLoading } = useMarketFiveMinuteData(market[0] ? market[0].id : undefined);

    const isLoading = isGreaterMarketDataLoading;

    const { tvl, volume, users, resolutionDate } = useMarketStats(market[0])

    return <>
        <Chart
            pool={pool}
            lowerMarket={undefined}
            greaterMarket={market[0]}
            lowerData={[]}
            greaterData={greaterMarketFiveMinuteData}
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