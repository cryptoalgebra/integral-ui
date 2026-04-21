import CurrencyLogo from "@/components/common/CurrencyLogo";
import TokenSelectorModal from "@/components/modals/TokenSelectorModal";
import { Input } from "@/components/ui/input";
import { cn, formatAmount } from "@/utils";
import { Currency, Percent } from "@cryptoalgebra/integral-sdk";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Address } from "viem";
import { useAccount, useBalance } from "wagmi";

const PERCENT_AMOUNT_PRESETS = [25, 50, 75] as const;

type PercentAmountPreset = typeof PERCENT_AMOUNT_PRESETS[number] | "MAX";

interface TokenSwapCardProps {
    label: string;
    handleTokenSelection: (currency: Currency) => void;
    handleValueChange?: (value: string) => void;
    handleMaxValue?: () => void;
    onPercentAmountSelect?: (percent: typeof PERCENT_AMOUNT_PRESETS[number]) => void;
    value: string;
    currency: Currency | null | undefined;
    otherCurrency: Currency | null | undefined;
    usdValue?: number | null;
    percentDifference?: number;
    isLoading?: boolean;
    priceImpact?: Percent;
    showMaxButton?: boolean;
    showPercentButtons?: boolean;
    showBalance?: boolean;
    showNativeToken?: boolean;
    disabled?: boolean;
}

const TokenCard = ({
    label,
    handleTokenSelection,
    handleValueChange,
    handleMaxValue,
    onPercentAmountSelect,
    value,
    currency,
    otherCurrency,
    usdValue,
    percentDifference,
    isLoading,
    showMaxButton,
    showPercentButtons,
    showBalance = true,
    showNativeToken,
    disabled,
}: TokenSwapCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activePreset, setActivePreset] = useState<PercentAmountPreset | null>(null);

    const { address: account } = useAccount();

    const { data: balance, isLoading: isBalanceLoading } = useBalance({
        address: account,
        token: currency?.isNative ? undefined : (currency?.wrapped.address as Address),
    });

    const balanceString = useMemo(() => {
        if (isBalanceLoading) return "Loading...";

        return formatAmount(balance?.formatted || "0", 6);
    }, [balance, isBalanceLoading]);

    const handleInput = (value: string) => {
        setActivePreset(null);

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

    useEffect(() => {
        if (!showMaxButton || value === "") {
            setActivePreset(null);
        }
    }, [showMaxButton, value]);

    useEffect(() => {
        setActivePreset(null);
    }, [currency?.wrapped.address]);

    const [prevElement, setPrevElement] = useState<React.ReactNode>(null);

    useEffect(() => {
        if (usdValue !== undefined && usdValue !== 0) {
            const formattedUsdValue = usdValue ? `≈ $${formatAmount(usdValue, 4)}` : "N/A";

            let formattedPercentDiff: string | undefined = undefined;

            if (percentDifference !== undefined && Number.isFinite(percentDifference)) {
                if (percentDifference > 0) {
                    formattedPercentDiff = `(+${percentDifference.toFixed(2)}%)`;
                } else if (percentDifference > -100 && percentDifference < 100) {
                    formattedPercentDiff = `(${percentDifference.toFixed(2)}%)`;
                }
            }

            const newElement = (
                <p className="text-text-muted">
                    {formattedUsdValue}
                    {percentDifference !== undefined && formattedPercentDiff && (
                        <span
                            className={
                                percentDifference > 1
                                    ? "text-primary"
                                    : percentDifference < -1 && percentDifference > -100
                                    ? "text-accent"
                                    : "text-text"
                            }
                        >
                            {` ${formattedPercentDiff}`}
                        </span>
                    )}
                </p>
            );

            setPrevElement(newElement);
        }

        if (value === "" && value === refValue.current) {
            const emptyElement = <p className="text-text-muted">≈ $0.00</p>;
            setPrevElement(emptyElement);
        }
    }, [percentDifference, usdValue, value]);

    const handleTokenSelect = useCallback(
        (newCurrency: Currency) => {
            setIsOpen(false);
            handleTokenSelection(newCurrency);
        },
        [handleTokenSelection],
    );

    const handlePercentAmount = useCallback(
        (preset: PercentAmountPreset) => {
            setActivePreset(preset);

            if (preset === "MAX") {
                handleMaxValue?.();
                return;
            }

            onPercentAmountSelect?.(preset);
        },
        [handleMaxValue, onPercentAmountSelect],
    );

    return (
        <div
            className={cn(
                "group/token flex w-full transform-gpu flex-col gap-3 rounded-xl bg-panel px-4 py-4 transition-all duration-300 ease-out hover:shadow-sm focus-within:border-primary/30 focus-within:shadow-sm",
                label === "Sell" ? "rounded-b-none" : label === "Buy" ? "rounded-t-none" : "",
            )}
        >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-medium uppercase tracking-wide text-text-muted">{label}</span>
                {showPercentButtons ? (
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {PERCENT_AMOUNT_PRESETS.map((preset) => (
                            <PercentAmountButton key={preset} active={activePreset === preset} onClick={() => handlePercentAmount(preset)}>
                                {preset}%
                            </PercentAmountButton>
                        ))}
                        <PercentAmountButton active={activePreset === "MAX"} onClick={() => handlePercentAmount("MAX")}>
                            MAX
                        </PercentAmountButton>
                    </div>
                ) : null}
            </div>

            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Input
                        disabled={disabled}
                        type={"text"}
                        value={value || refValue.current}
                        id={`amount-${currency?.symbol}`}
                        onUserInput={(v) => handleInput(v)}
                        className={cn(
                            "h-auto w-full rounded-none border-none bg-transparent p-0 text-4xl font-medium leading-none text-text placeholder:text-text-muted shadow-none ring-0! transition-colors duration-200 disabled:cursor-default disabled:text-text/80",
                            isLoading ? "animate-pulse" : "",
                        )}
                        placeholder={"0"}
                        maxDecimals={currency?.decimals}
                    />
                </div>

                <div className="flex min-w-fit flex-col items-end gap-3">
                    <TokenSelectorModal
                        showNativeToken={showNativeToken}
                        onSelect={handleTokenSelect}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        otherCurrency={otherCurrency}
                    >
                        <button
                            type="button"
                            className="group flex transform-gpu items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm font-medium text-text transition-all duration-300 ease-out hover:-translate-y-px hover:border-primary/20 hover:bg-card hover:shadow-sm"
                            onClick={() => setIsOpen(true)}
                        >
                            <CurrencyLogo currency={currency} size={24} />
                            <span>{currency ? currency.symbol : "Select"}</span>
                            <ChevronDown
                                size={14}
                                className="text-text-muted transition-transform duration-300 group-hover:translate-y-px"
                            />
                        </button>
                    </TokenSelectorModal>
                </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div
                    className={cn(
                        "flex min-h-5 items-center text-xs text-text-muted transition-opacity duration-200",
                        isLoading ? "animate-pulse" : "",
                    )}
                >
                    {prevElement}
                </div>
                {currency && showBalance && (
                    <div className=" text-right text-xs text-text-muted transition-colors duration-300 group-hover/token:border-primary/15">
                        <span>Balance: </span>
                        <span>{balanceString}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const PercentAmountButton = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button
        type="button"
        className={cn(
            "rounded-sm px-2.5 py-1 text-xs font-medium transition-all duration-200 ease-out ",
            active ? "bg-card text-text" : "bg-card text-text-muted hover:bg-bg-300/20 hover:text-text",
        )}
        onClick={onClick}
    >
        {children}
    </button>
);

export default TokenCard;
