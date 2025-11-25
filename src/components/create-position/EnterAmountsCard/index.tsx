import CurrencyLogo from "@/components/common/CurrencyLogo";
import { Input } from "@/components/ui/input";
import { formatAmount } from "@/utils";
import { Currency, Field } from "@cryptoalgebra/custom-pools-sdk";
import { useCallback, useMemo } from "react";
import { Address } from "viem";
import { useAccount, useBalance } from "wagmi";
import { useMintState } from "@/state/mintStore";
import { unwrappedToken } from "@/utils/common/unwrappedToken";
import BoostedPoolsModule from "@/modules/BoostedPoolsModule";

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
        [handleChange]
    );

    function setMax() {
        handleChange(balance?.formatted || "0");
    }

    return (
        <div className="flex w-full bg-card-dark p-3 rounded-lg flex-col gap-3">
            <div className="flex w-full">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 min-h-10">
                        <div className="relative w-12 h-12">
                            <CurrencyLogo currency={displayCurrency} size={48} />
                        </div>

                        <div>
                            <div className="text-sm text-text-200">{displayCurrency ? displayCurrency.name : ""}</div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">{displayCurrency ? displayCurrency.symbol : "Select a token"}</span>
                            </div>
                        </div>
                    </div>
                    {displayCurrency && (
                        <div className={"flex text-sm whitespace-nowrap"}>
                            <div>
                                <span className="font-semibold">Balance: </span>
                                <span>{balanceString}</span>
                            </div>
                            <button className="ml-2 text-primary-50 underline underline-offset-4 hover:text-primary-50/70" onClick={setMax}>
                                Max
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end w-full gap-2">
                    <Input
                        value={value}
                        id={`amount-${displayCurrency?.symbol}`}
                        onUserInput={(v) => handleInput(v)}
                        className={`text-right border-none text-xl font-bold w-9/12 p-0 ring-0!`}
                        placeholder={"0.0"}
                        maxDecimals={displayCurrency?.decimals}
                    />
                    {valueUsd && (
                        <div className="text-sm">
                            <div>${formatAmount(valueUsd, 2)}</div>
                        </div>
                    )}
                </div>
            </div>

            <BoostedTokenWrapToggle currency={currency} field={field} currentValue={value} onAmountChange={handleChange} />
        </div>
    );
};

export default EnterAmountCard;
