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
import { Button } from "@/components/ui/button";

const { BoostedTokenWrapToggle } = BoostedPoolsModule.components;

interface EnterAmountsCardProps {
    currency: Currency | undefined;
    value: string;
    handleChange: (value: string) => void;
    valueUsd?: number | null;
    field: Field;
}

const EnterAmountCard = ({ currency, value, handleChange, valueUsd, field }: EnterAmountsCardProps) => {
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

    function setMax() {
        handleChange(balance?.formatted || "0");
    }

    return (
        <div className="flex w-full border p-2 rounded-lg flex-col gap-20 px-3">
            <div className="flex flex-col w-full">
                <div className="flex items-end gap-2">
                    <Input
                        value={value}
                        id={`amount-${displayCurrency?.symbol}`}
                        onUserInput={(v) => handleInput(v)}
                        className={`text-left border-none text-xl font-bold w-9/12 p-0 ring-0!`}
                        placeholder={"0.0"}
                        maxDecimals={displayCurrency?.decimals}
                    />

                    <div className="flex items-center ml-auto gap-2 min-h-10">
                        <CurrencyLogo currency={displayCurrency} size={24} />
                        <span className="font-bold text-sm">{displayCurrency ? displayCurrency.symbol : "Select a token"}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between w-full gap-2">
                    {valueUsd && (
                        <div className="text-xs text-text-muted">
                            <div>${formatAmount(valueUsd, 2)}</div>
                        </div>
                    )}

                    {displayCurrency && (
                        <div className={"flex items-center text-sm whitespace-nowrap ml-auto"}>
                            <div>
                                <span className="font-medium text-xs">Balance: </span>
                                <span>{balanceString}</span>
                            </div>
                            <Button variant={"icon"} size={"icon"} className="text-primary-200 h-5 text-xs ml-1" onClick={setMax}>
                                Max
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <BoostedTokenWrapToggle currency={currency} field={field} currentValue={value} onAmountChange={handleChange} />
        </div>
    );
};

export default EnterAmountCard;
