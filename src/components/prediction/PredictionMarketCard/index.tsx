import CurrencyLogo from "@/components/common/CurrencyLogo";
import { PredictionMarket } from "@/types/prediction";
import { cn } from "@/utils";
import { formatDateDDMM } from "@/utils/common/formatDate";
import { Pool } from "@cryptoalgebra/integral-sdk";
import { Clock } from "lucide-react";
import { formatUnits } from "viem";

interface IPredictionMarketCard {
    market: PredictionMarket;
    pool: Pool | undefined | null;
    isSelected: boolean;
    onSelect: (idx: PredictionMarket) => void;
}

const styles = {
    greater: "text-green-300",
    lower: "text-rose-300"
}

const PredictionMarketCard = ({ market, pool, isSelected, onSelect }: IPredictionMarketCard ) => {

    const marketCurrency = market.marketToken === 0 ? pool?.token0 : pool?.token1;
    const quoteCurrency = market.marketToken === 0 ? pool?.token1 : pool?.token0;

    const formattedCondition = quoteCurrency ? formatUnits(BigInt(market.mark), quoteCurrency.decimals).split(".")[0] : 0;

    return <button onClick={() => onSelect(market)} className={cn(
            "flex text-left w-full px-4 py-4 bg-card-dark border rounded-lg duration-200",
            isSelected ? "border-primary" : "border-card-border hover:bg-card-hover"
        )}>
        <div className="flex items-center gap-4">
            <CurrencyLogo currency={marketCurrency} size={36} />
            <div>
                <div className="flex items-center uppercase text-xs text-text-200">
                    <span className="uppercase text-xs">Market</span>
                    <span className="mx-1">•</span>
                    <span className="inline-flex items-center gap-1">
                        <Clock size={10}/>
                        <span>{formatDateDDMM(market.plannedResolutionTimestamp)}</span>
                    </span>
                </div>
                <div>
                    <span>{`Will ${marketCurrency?.symbol} be`}</span>
                    <span className={cn("mx-1", styles[market.condition])}>{`${market.condition} than`}</span>
                    <span>{`${formattedCondition} ${quoteCurrency?.symbol}?`}</span>
                </div>
            </div>
        </div>
    </button>

};

export default PredictionMarketCard;