import CurrencyLogo from "@/components/common/CurrencyLogo";
import TokenSelectorModal from "@/components/modals/TokenSelectorModal";
import { Input } from "@/components/ui/input";
import { cn, formatAmount } from "@/utils";
import { Currency, CurrencyAmount, maxAmountSpend, Percent } from "@cryptoalgebra/integral-sdk";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Address, formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";

interface TokenSwapCardProps {
    handleTokenSelection?: (currency: Currency) => void;
    handleValueChange?: (value: string) => void;
    value: string;
    currency: Currency | null | undefined;
    otherCurrency?: Currency | null | undefined;
    usdValue?: number | null;
    percentDifference?: number;
    isLoading?: boolean;
    priceImpact?: Percent;
    showBalance?: boolean;
    showNativeToken?: boolean;
    disabled?: boolean;
    showPercentButtons?: boolean;
    overrideBalance?: bigint;
    label?: string;
}

const TokenCard = ({
    handleTokenSelection,
    handleValueChange,
    value,
    currency,
    otherCurrency,
    usdValue,
    percentDifference,
    isLoading,
    showBalance = true,
    showNativeToken = true,
    disabled,
    label,
    overrideBalance,
    showPercentButtons = false,
}: TokenSwapCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const { address: account } = useAccount();

    const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
        address: account,
        token: currency?.isNative ? undefined : (currency?.wrapped.address as Address),
    });

    const balance = overrideBalance ?? balanceData?.value;

    const balanceString = useMemo(() => {
        if ((isBalanceLoading && overrideBalance === undefined) || !currency) return "...";
        return formatAmount(formatUnits(balance || 0n, currency.decimals), 6);
    }, [balance, isBalanceLoading, currency, overrideBalance]);

    const handleInput = (value: string) => {
        let _value = value;
        if (value === ".") {
            _value = "0.";
        }
        handleValueChange?.(_value);
    };

    const refValue = useRef(value);

    useEffect(() => {
        if (value !== refValue.current && value !== "") {
            refValue.current = value;
        } else if (value === "" && !isLoading) {
            refValue.current = "";
        }
    }, [value, isLoading]);

    const formattedUsdValue = useMemo(() => {
        if (usdValue === undefined || usdValue === null || usdValue === 0) return "$0.00";
        return `$${formatAmount(usdValue, 2)}`;
    }, [usdValue]);

    const formattedPercentDiff = useMemo(() => {
        if (percentDifference === undefined || !Number.isFinite(percentDifference)) return null;
        if (percentDifference > 0) return `(+${percentDifference.toFixed(2)}%)`;
        if (percentDifference > -100 && percentDifference < 100) return `(${percentDifference.toFixed(2)}%)`;
        return null;
    }, [percentDifference]);

    const percentDiffColor = useMemo(() => {
        if (!percentDifference) return "text-text-300";
        if (percentDifference > 1) return "text-green-400";
        if (percentDifference > -1) return "text-text-300";
        if (percentDifference > -3) return "text-orange-400";
        return "text-red-400";
    }, [percentDifference]);

    const maxInputAmount: CurrencyAmount<Currency> | undefined =
        currency && balance ? maxAmountSpend(CurrencyAmount.fromRawAmount(currency, balance.toString())) : undefined;
    const showMaxButton = Boolean(maxInputAmount?.greaterThan(0));

    const handleMaxInput = useCallback(() => {
        maxInputAmount && handleInput(maxInputAmount.toSignificant(24));
    }, [maxInputAmount]);

    const handlePercentInput = useCallback(
        (percent: number) => {
            if (maxInputAmount) {
                const amount = Number(maxInputAmount.toSignificant(24)) * (percent / 100);
                handleInput(amount.toString());
            }
        },
        [maxInputAmount],
    );

    const handleTokenSelect = useCallback(
        (newCurrency: Currency) => {
            setIsOpen(false);
            handleTokenSelection?.(newCurrency);
        },
        [handleTokenSelection],
    );

    return (
        <div
            className={cn(
                "flex flex-col  group w-full p-3 gap-3 bg-card-light rounded-xl transition-all duration-200 hover:bg-card-light/90",
                showPercentButtons && isFocused ? "h-fit" : "h-fit",
            )}
        >
            <div className="flex relative items-center justify-between gap-2">
                {label && <span className="flex items-center gap-2 text-xs uppercase text text-text-300 tracking-wide">{label}</span>}
                {showPercentButtons && isFocused && currency && (
                    <div className="absolute -right-1 items-center gap-2 transition-all duration-300 flex animate-fade-in">
                        {[25, 50, 75].map((percent) => (
                            <button
                                key={percent}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handlePercentInput(percent)}
                                className="w-fit px-3 py-1 flex-1 text-xs font-medium text-text-300 bg-card-border/50 hover:bg-card-border/80 rounded-full transition-all duration-200"
                            >
                                {percent}%
                            </button>
                        ))}
                        {showMaxButton && (
                            <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={handleMaxInput}
                                className="w-fit px-3 py-1 flex-1 text-xs font-medium text-text-300 bg-card-border/50 hover:bg-card-border/80 rounded-full transition-all duration-200"
                            >
                                MAX
                            </button>
                        )}
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between gap-12">
                {handleTokenSelection ? (
                    <TokenSelectorModal
                        showNativeToken={showNativeToken}
                        onSelect={handleTokenSelect}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        otherCurrency={otherCurrency}
                    >
                        <button
                            className={cn("group flex items-center gap-2 min-w-fit rounded-full transition-all duration-200")}
                            onClick={() => setIsOpen(true)}
                        >
                            {currency && <CurrencyLogo currency={currency} size={28} />}
                            <span className="font-semibold text-lg whitespace-nowrap">{currency ? currency.symbol : "Select"}</span>
                            <ChevronDown size={16} className="text-text-300 min-w-[16px]" />
                        </button>
                    </TokenSelectorModal>
                ) : (
                    <button
                        className={cn("group flex items-center gap-2 min-w-fit rounded-full transition-all duration-200")}
                        onClick={() => setIsOpen(true)}
                    >
                        {currency && <CurrencyLogo currency={currency} size={28} />}
                        <span className="font-semibold text-lg whitespace-nowrap">{currency ? currency.symbol : "-"}</span>
                    </button>
                )}

                <Input
                    disabled={disabled}
                    type={"text"}
                    value={value || refValue.current}
                    id={`amount-${currency?.symbol}`}
                    onUserInput={(v) => handleInput(v)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={cn(
                        "text-right bg-transparent border-none placeholder:text-text-300 text-3xl font-semibold w-full p-0 focus:ring-0 focus-visible:ring-0",
                        isLoading ? "animate-pulse" : "",
                        disabled ? "text-text-300" : "text-text",
                    )}
                    placeholder={"0.00"}
                    maxDecimals={currency?.decimals}
                />
            </div>

            <div className="flex items-center justify-between ">
                {currency && showBalance && (
                    <div className="flex items-center gap-2 text-xs text-text-300">
                        <span>Balance: {balanceString}</span>
                    </div>
                )}

                <div className={cn("flex items-center gap-1.5 text-xs", isLoading ? "animate-pulse" : "")}>
                    <span className="text-text-300">{formattedUsdValue}</span>
                    {formattedPercentDiff && <span className={percentDiffColor}>{formattedPercentDiff}</span>}
                </div>
            </div>
        </div>
    );
};

export default TokenCard;
