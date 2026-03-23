import { useEffect, useState } from "react";
import PredictionMarketCard from "../PredictionMarketCard";
import { usePoolMarkets } from "@/hooks/prediction/usePoolMarkets";
import { usePool } from "@/hooks/pools/usePool";
import { PredictionMarket } from "@/types/prediction";
import { useUserMarkets } from "@/hooks/prediction/useUserMarkets";
import { useAccount } from "wagmi";


const PredictionMarkets = () => {

    const { address: account } = useAccount()

    const { data: poolMarkets } = usePoolMarkets("0x671ddf7e29272c5bf6996f765fabf58351cff137")
    const { data: { closedMarkets, openedMarkets } } = useUserMarkets(account)

    const [selectedMarket, selectMarket] = useState<PredictionMarket>()

    const [, pool] = usePool("0x671ddf7e29272c5bf6996f765fabf58351cff137")

    useEffect(() => {
        if (!selectedMarket && poolMarkets[0]) {
            selectMarket(poolMarkets[0])
        }
    }, [poolMarkets])

    return <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
            <div className="text-xl font-semibold">All Markets</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-b-lg">
            {
                poolMarkets.map((market) => (
                    <PredictionMarketCard
                        key={market.id}
                        market={market}
                        pool={pool}
                    />
                ))
            }
        </div>
        {Boolean(openedMarkets.length) && <div className="text-left">
            <div className="text-xl font-semibold mb-4">My Opened Markets</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-b-lg">
                {
                    openedMarkets.map((market) => (
                        <PredictionMarketCard
                            key={market.id}
                            market={market}
                            pool={pool}
                        />
                    ))
                }
            </div>
        </div>}
        {Boolean(closedMarkets.length) && <div className="text-left">
            <div className="text-xl font-semibold mb-4">My Closed Markets</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-b-lg">
                {
                    closedMarkets.map((market) => (
                        <PredictionMarketCard
                            key={market.id}
                            market={market}
                            pool={pool}
                        />
                    ))
                }
            </div>
        </div>}
    </div>
}

export default PredictionMarkets;