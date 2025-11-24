import CurrencyLogo from "@/components/common/CurrencyLogo";
import TokenSelectorModal from "@/components/modals/TokenSelectorModal";
import { Input } from "@/components/ui/input";
import { cn, formatAmount } from "@/utils";
import { Currency, Percent } from "@cryptoalgebra/custom-pools-sdk";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Address } from "viem";
import { useAccount, useBalance } from "wagmi";

interface TokenSwapCardProps {
    handleTokenSelection: (currency: Currency) => void;
    handleValueChange?: (value: string) => void;
    handleMaxValue?: () => void;
    value: string;
    currency: Currency | null | undefined;
    otherCurrency: Currency | null | undefined;
    usdValue?: number | null;
    percentDifference?: number;
    isLoading?: boolean;
    priceImpact?: Percent;
    showMaxButton?: boolean;
    showBalance?: boolean;
    showNativeToken?: boolean;
    disabled?: boolean;
}

const TokenCard = ({
    handleTokenSelection,
    handleValueChange,
    handleMaxValue,
    value,
    currency,
    otherCurrency,
    usdValue,
    percentDifference,
    isLoading,
    showMaxButton,
    showBalance = true,
    showNativeToken,
    disabled,
}: TokenSwapCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

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
                <p className="text-text-200">
                    {formattedUsdValue}
                    {percentDifference !== undefined && formattedPercentDiff && (
                        <span
                            className={
                                percentDifference > 1
                                    ? "text-green-500"
                                    : (percentDifference > 0 && percentDifference < 1) || (percentDifference < 0 && percentDifference > -1)
                                    ? "text-text-100"
                                    : percentDifference < -1 && percentDifference > -3
                                    ? "text-orange-300"
                                    : percentDifference < -3 && percentDifference > -100
                                    ? "text-red-400"
                                    : "text-text-100"
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
            const emptyElement = <p className="text-text-200">≈ $0.00</p>;
            setPrevElement(emptyElement);
        }
    }, [percentDifference, usdValue, value]);

    const handleTokenSelect = useCallback(
        (newCurrency: Currency) => {
            setIsOpen(false);
            handleTokenSelection(newCurrency);
        },
        [handleTokenSelection]
    );

    return (
        <div className="flex w-full px-4 py-4 bg-card-dark border border-card-border rounded-lg">
            <div className="flex flex-col gap-2 min-w-fit">
                <TokenSelectorModal
                    showNativeToken={showNativeToken}
                    onSelect={handleTokenSelect}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    otherCurrency={otherCurrency}
                >
                    <button
                        className="group flex items-center gap-4 py-1 w-fit bg-card rounded-lg text-left"
                        onClick={() => setIsOpen(true)}
                    >
                        <div className="relative w-12 h-12">
                            <CurrencyLogo currency={currency} size={48} />
                            {currency && (
                                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-linear-to-b from-white/0 to-white/30 border border-card-dark shadow-primary/40 group-hover:border-primary group-hover:shadow-lg duration-100" />
                            )}
                        </div>

                        <div>
                            <div className="text-sm text-text-200">{currency ? currency.name : ""}</div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">{currency ? currency.symbol : "Select a token"}</span>
                                <ChevronRight size={16} className="duration-100 group-hover:rotate-90" />
                            </div>
                        </div>
                    </button>
                </TokenSelectorModal>
                {currency && (
                    <div className={"flex text-sm whitespace-nowrap"}>
                        {showBalance && (
                            <div className="text-text-200">
                                <span className="font-semibold">Balance: </span>
                                <span>{balanceString}</span>
                            </div>
                        )}
                        {showMaxButton && (
                            <button
                                className="ml-2 text-primary-50 underline underline-offset-4 hover:text-primary-50/70"
                                onClick={handleMaxValue}
                            >
                                Max
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col items-end w-full gap-2 relative">
                <Input
                    disabled={disabled}
                    type={"text"}
                    value={value || refValue.current}
                    id={`amount-${currency?.symbol}`}
                    onUserInput={(v) => handleInput(v)}
                    className={cn(
                        `text-right border-none text-xl font-bold w-9/12 p-0 mt-2 disabled:cursor-default disabled:text-text/80 ring-0!`,
                        isLoading ? "animate-pulse" : ""
                    )}
                    placeholder={"0.0"}
                    maxDecimals={currency?.decimals}
                />
                {/* {!isLoading ? <Skeleton className="absolute left-2 top-1 z-10 h-8 w-full" /> : null} */}
                {/* {!isLoading ? <Skeleton className="absolute bottom-0 left-2 z-10 h-6 w-full" /> : null} */}
                <div
                    className={cn(
                        "relative bottom-0 ml-auto mt-auto flex h-6 min-w-max items-center gap-1 text-sm text-text-200",
                        isLoading ? "animate-pulse" : ""
                    )}
                >
                    {prevElement}
                </div>
            </div>
        </div>
    );
};

export default TokenCard;
