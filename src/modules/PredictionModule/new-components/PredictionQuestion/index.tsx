import { Currency } from "@cryptoalgebra/integral-sdk";
import { PredictionMarket } from "../../types";
import { formatUnits } from "viem";
import { cn, formatAmount } from "@/utils";

export function PredictionQuestion({
    market,
    marketCurrency,
    quoteCurrency,
}: {
    market: PredictionMarket;
    marketCurrency: Currency | undefined;
    quoteCurrency: Currency | undefined;
}) {
    const isGreater = market.condition === "greater";
    const quoteAmount = quoteCurrency ? formatUnits(BigInt(market.mark), quoteCurrency.decimals) : undefined;

    return (
        <div className="flex items-center gap-1 font-semibold md:text-lg text-sm bg-card-light rounded-xl p-3">
            <span className=" text-white">Will {marketCurrency?.symbol}</span>{" "}
            <span className={cn(isGreater ? "text-green-400" : "text-red-400")}>be {market.condition} than</span>{" "}
            <span>
                {formatAmount(quoteAmount || 0, 6)} {quoteCurrency?.symbol}?
            </span>
        </div>
    );
}
