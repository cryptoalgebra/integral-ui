import { Currency } from "@cryptoalgebra/integral-sdk";
import { PredictionMarket } from "../../types";
import { formatUnits } from "viem";
import { cn, formatAmount } from "@/utils";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { useCurrency } from "@/hooks/common/useCurrency";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { useAllOpenMarkets } from "../../hooks";

export function PredictionQuestion({
    // markets,
    market,
    marketCurrency,
    quoteCurrency,
}: {
    // markets: PredictionMarket[];
    market: PredictionMarket;
    marketCurrency: Currency | undefined;
    quoteCurrency: Currency | undefined;
}) {
    const { data: markets } = useAllOpenMarkets();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const isGreater = market.condition === "greater";
    const quoteAmount = quoteCurrency ? formatUnits(BigInt(market.mark), quoteCurrency.decimals) : undefined;

    const handleSelectMarket = (selectedMarket: PredictionMarket) => {
        setOpen(false);
        navigate(`/prediction/${selectedMarket.id}`);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="flex items-center justify-between gap-2 w-full font-semibold md:text-lg text-sm bg-card-light rounded-xl p-3 hover:bg-card-border/40 transition-colors cursor-pointer text-left">
                    <div className="flex items-center gap-1 flex-wrap">
                        <CurrencyLogo className="mr-1" currency={marketCurrency} size={28} />
                        <span className="text-white">Will {marketCurrency?.symbol}</span>{" "}
                        <span className={cn(isGreater ? "text-green-400" : "text-red-400")}>be {market.condition} than</span>{" "}
                        <span>
                            {formatAmount(quoteAmount || 0, 6)} {quoteCurrency?.symbol}?
                        </span>
                    </div>
                    <ChevronDown size={20} className={cn("text-text-300 flex-shrink-0 transition-transform", open && "rotate-180")} />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] bg-card-light max-h-[300px] overflow-y-auto p-2"
            >
                <div className="flex flex-col gap-1">
                    {markets.map((m) => (
                        <MarketOption key={m.id} market={m} isSelected={m.id === market.id} onSelect={() => handleSelectMarket(m)} />
                    ))}
                    {markets.length === 0 && <div className="text-sm text-text-300 text-center py-4">No markets available</div>}
                </div>
            </PopoverContent>
        </Popover>
    );
}

function MarketOption({ market, isSelected, onSelect }: { market: PredictionMarket; isSelected: boolean; onSelect: () => void }) {
    const marketCurrency = useCurrency(market.marketToken);
    const quoteCurrency = useCurrency(market.quoteToken);
    const isGreater = market.condition === "greater";
    const quoteAmount = quoteCurrency ? formatUnits(BigInt(market.mark), quoteCurrency.decimals) : undefined;

    return (
        <button
            onClick={onSelect}
            className={cn(
                "flex items-center gap-1 flex-wrap w-full text-left text-sm p-2 rounded-lg transition-colors",
                isSelected ? "bg-card-border text-white" : "hover:bg-card-border/50 text-text-200",
            )}
        >
            <CurrencyLogo className="mr-1" currency={marketCurrency} size={18} />
            <span className="text-white">Will {marketCurrency?.symbol}</span>{" "}
            <span className={cn(isGreater ? "text-green-400" : "text-red-400")}>be {market.condition} than</span>{" "}
            <span>
                {formatAmount(quoteAmount || 0, 6)} {quoteCurrency?.symbol}?
            </span>
        </button>
    );
}
