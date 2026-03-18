import { useEffect, useState } from "react";
import PredictionMarketCard from "../PredictionMarketCard";
import { usePoolMarkets } from "@/hooks/prediction/usePoolMarkets";
import { usePool } from "@/hooks/pools/usePool";
import { PredictionMarket } from "@/types/prediction";
import PredictionSideSelector from "../PredictionSideSelector";
import { cn } from "@/utils";


const PredictionMarkets = () => {

    const handleSelectMarket = (market: PredictionMarket) => {
        selectMarket(market)
    }

    const { data: poolMarkets } = usePoolMarkets("0x671ddf7e29272c5bf6996f765fabf58351cff137")

    const [selectedMarket, selectMarket] = useState<PredictionMarket>()
    const [action, setAction] = useState<"buy" | "sell">("buy")
    
    const [, pool] = usePool("0x671ddf7e29272c5bf6996f765fabf58351cff137")

    useEffect(() => {
        if (!selectedMarket && poolMarkets[0]) {
            selectMarket(poolMarkets[0])
        }
    }, [poolMarkets])

    return <div className="grid grid-col-1 gap-2 p-2 bg-card-dark border border-card-border rounded-b-lg">
        {
            poolMarkets.map((market) => (
                <PredictionMarketCard
                    key={market.mark}
                    market={market}
                    pool={pool}
                    isSelected={market.id === selectedMarket?.id}
                    onSelect={handleSelectMarket}
                />
            ))
        }
        <div>
            <div className="flex font-semibold">
                <button className={cn("border-b-2 pb-2 px-2 transition", action === "buy" ? "border-primary" : "border-transparent hover:border-white/20")} onClick={() => setAction("buy")}>Buy</button>
                <button className={cn("border-b-2 pb-2 px-2 transition", action === "sell" ? "border-primary" : "border-transparent hover:border-white/20")} onClick={() => setAction("sell")}>Sell</button>
            </div>
            <div className="p-2 pb-0 -mx-2 border-t border-card-border">
                <PredictionSideSelector
                    market={selectedMarket}
                    action={action}
                />
            </div>
        </div>
    </div>
}

export default PredictionMarkets;