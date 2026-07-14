import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { useUSDCValue } from "@/hooks/common/useUSDCValue";
import { formatAmount } from "@/utils";
import { Currency, CurrencyAmount } from "@cryptoalgebra/integral-sdk";
import { useMemo } from "react";
import { formatUnits } from "viem";

interface NAVHookTokenValueCardProps {
    currency: Currency | undefined;
    amountRaw: bigint;
}

export function NAVHookTokenValueCard({ currency, amountRaw }: NAVHookTokenValueCardProps) {
    const amount = useMemo(() => (currency ? CurrencyAmount.fromRawAmount(currency, amountRaw.toString()) : undefined), [
        amountRaw,
        currency,
    ]);
    const { formatted: amountUSD } = useUSDCValue(amount);

    return (
        <div className="flex min-h-12 flex-1 items-center gap-3 rounded-full bg-card-light px-4 py-2">
            <CurrencyLogo currency={currency} size={34} />
            <div className="min-w-0 text-left">
                <div className="flex min-w-0 items-baseline gap-1">
                    {currency ? (
                        <>
                            <span className="truncate font-semibold text-text-100">
                                {formatAmount(formatUnits(amountRaw, currency.decimals), 6)}
                            </span>
                            <span className="text-text-300">{currency.symbol}</span>
                        </>
                    ) : (
                        <Skeleton className="h-5 w-28 bg-card-light" />
                    )}
                </div>
                <div className="text-sm text-text-300">${formatAmount(amountUSD || 0, 2)}</div>
            </div>
        </div>
    );
}
