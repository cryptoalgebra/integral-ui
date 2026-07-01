import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Input } from "@/components/ui/input";
import { formatAmount } from "@/utils";
import { Currency, Field } from "@cryptoalgebra/integral-sdk";
import { useCallback, useMemo } from "react";
import { Address } from "viem";
import { useAccount, useBalance } from "wagmi";
import { useMintState } from "@/state/mintStore";
import { unwrappedToken } from "@/utils/common/unwrappedToken";
import BoostedPoolsModule from "@/modules/BoostedPoolsModule";
import { enabledModules } from "config";

const { BoostedTokenWrapToggle } = BoostedPoolsModule.components;

interface EnterAmountsCardProps {
    currency: Currency | undefined;
    value: string;
    handleChange: (value: string) => void;
    valueUsd?: number | null;
    field: Field;
    showBoostedToggle?: boolean;
}

const EnterAmountCard = ({
    currency,
    value,
    handleChange,
    valueUsd,
    field,
    showBoostedToggle = enabledModules.ALMModule,
}: EnterAmountsCardProps) => {
    const { address: account } = useAccount();
    const { token0InputMode, token1InputMode } = useMintState();

    const isToken0 = field === Field.CURRENCY_A;
    const currentInputMode = isToken0 ? token0InputMode : token1InputMode;

    const displayCurrency = useMemo(() => {
        if (!currency) return;
        if (!currency.isBoosted) return currency;

        return currentInputMode === "underlying" ? unwrappedToken(currency?.wrapped.underlying) : currency;
    }, [currency, currentInputMode]);

    const { data: balance, isLoading } = useBalance({
        address: account,
        token: displayCurrency?.isNative ? undefined : (displayCurrency?.wrapped.address as Address),
    });

    const balanceString = useMemo(() => {
        if (isLoading) return "Loading...";

        return formatAmount(balance?.formatted || "0");
    }, [balance, isLoading]);

    const handleInput = useCallback(
        (value: string) => {
            if (value === ".") value = "0.";
            handleChange(value);
        },
        [handleChange],
    );

    // function setMax() {
    //     handleChange(balance?.formatted || "0");
    // }

    return (
        <div className="flex w-full flex-col gap-3 rounded-xl bg-card-light p-3 transition-colors hover:bg-card-light/90">
            <div className="flex w-full items-center justify-between gap-6">
                <div className="flex min-w-fit items-center gap-2">
                    <CurrencyLogo currency={displayCurrency} size={30} />
                    <span className="max-w-[150px] truncate text-lg font-semibold text-text-100">
                        {displayCurrency ? displayCurrency.symbol : "Select"}
                    </span>
                </div>

                <Input
                    value={value}
                    id={`amount-${displayCurrency?.symbol}`}
                    onUserInput={(v) => handleInput(v)}
                    className="w-full border-none bg-transparent p-0 text-right text-2xl font-semibold text-text-100 placeholder:text-text-300 focus:ring-0 focus-visible:ring-0"
                    placeholder="0.00"
                    maxDecimals={displayCurrency?.decimals}
                />
            </div>

            <div className="flex items-center justify-between gap-3 text-xs text-text-300">
                {displayCurrency ? <span>Balance: {balanceString}</span> : <span />}
                {valueUsd !== undefined && valueUsd !== null && <span>${formatAmount(valueUsd, 2)}</span>}
            </div>

            {showBoostedToggle && (
                <BoostedTokenWrapToggle currency={currency} field={field} currentValue={value} onAmountChange={handleChange} />
            )}
        </div>
    );
};

export default EnterAmountCard;
