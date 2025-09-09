import { formatAmount } from "@/utils/common/formatAmount";
import CurrencyLogo from "../CurrencyLogo";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import { Skeleton } from "@/components/ui/skeleton";

interface CurrencyAmountsProps {
    amount0Parsed: string | undefined;
    amount1Parsed: string | undefined;
    token0: Currency | undefined;
    token1: Currency | undefined;
}

export function CurrencyAmounts({ amount0Parsed, amount1Parsed, token0, token1 }: CurrencyAmountsProps) {
    return (
        <div className="flex flex-col w-full bg-card-dark gap-4 rounded-lg">
            <div className="flex justify-between gap-2 items-center">
                <div className="flex items-center gap-2">
                    <CurrencyLogo currency={token0} size={24} />
                    {token0?.symbol}
                </div>
                {amount0Parsed ? <span>{formatAmount(amount0Parsed, 6)}</span> : <Skeleton className="w-32 h-5" />}
            </div>
            <div className="flex justify-between gap-2 items-center">
                <div className="flex items-center gap-2">
                    <CurrencyLogo currency={token1} size={24} />
                    {token1?.symbol}
                </div>
                {amount1Parsed ? <span>{formatAmount(amount1Parsed, 6)}</span> : <Skeleton className="w-32 h-5" />}
            </div>
        </div>
    );
}
