import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSwapState } from "@/state/swapStore";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import { useCallback, useEffect, useState } from "react";
import { LimitOrderDirection, LimitOrderDirectionType } from "../../types";

interface LimitPriceCardProps {
    currency: Currency | undefined;
    otherCurrency: Currency | undefined;
    sellPrice: string;
    plusDisabled: boolean;
    minusDisabled: boolean;
    disabled: boolean;
    invertTick: (value: string) => void;
    setSellPrice: (value: string) => void;
    tickStep: (direction: 1 | -1) => void;
    setToMarketPrice: (invert: boolean) => void;
}

export const LimitPriceCard = ({
    currency,
    otherCurrency,
    sellPrice,
    plusDisabled,
    minusDisabled,
    disabled,
    invertTick,
    setSellPrice,
    tickStep,
    setToMarketPrice,
}: LimitPriceCardProps) => {
    const [limitOrderType, setLimitOrderType] = useState<LimitOrderDirectionType>(LimitOrderDirection.SELL);

    const [localPrice, setLocalPrice] = useState("");

    const {
        actions: { limitOrderPriceFocused },
    } = useSwapState();

    const handleOnBlur = useCallback(() => {
        setSellPrice(localPrice);
        limitOrderPriceFocused(false);
    }, [localPrice]);

    const handleInput = useCallback(() => {
        limitOrderPriceFocused(true);
    }, []);

    useEffect(() => {
        if (sellPrice) {
            setLocalPrice(sellPrice);
        } else if (sellPrice === "") {
            setLocalPrice("");
        }
    }, [sellPrice]);

    useEffect(() => {
        setToMarketPrice(Boolean(limitOrderType));
    }, [currency, otherCurrency]);

    return (
        <div className={`flex flex-col gap-4 bg-card-dark p-3 border boder-card-border rounded-lg ${disabled ? "disabled" : ""} `}>
            <div className="flex justify-between w-full">
                <div className="text-sm font-semibold">
                    {currency
                        ? limitOrderType === LimitOrderDirection.SELL
                            ? `Sell ${currency?.symbol} at rate`
                            : `Buy ${otherCurrency?.symbol} at rate`
                        : ""}
                </div>
                <div className="flex gap-4">
                    <button
                        className="text-sm text-primary-50 underline underline-offset-4 hover:text-primary-50/70"
                        disabled={disabled}
                        onClick={() => setToMarketPrice(Boolean(limitOrderType))}
                    >
                        Set to market
                    </button>
                    {otherCurrency ? (
                        <button
                            disabled={disabled}
                            className="flex items-center text-sm text-primary-50 underline underline-offset-4 hover:text-primary-50/70"
                            onClick={() => {
                                setLimitOrderType(Number(!limitOrderType));
                                invertTick(localPrice);
                            }}
                        >
                            {limitOrderType === LimitOrderDirection.SELL ? (
                                <div>{`Buy ${otherCurrency?.symbol}`}</div>
                            ) : (
                                <div>{`Sell ${currency?.symbol}`}</div>
                            )}
                        </button>
                    ) : null}
                </div>
            </div>
            <div className="flex items-center justify-between w-full">
                <Input
                    value={localPrice}
                    id={`sellPrice`}
                    onBlur={handleOnBlur}
                    onInput={handleInput}
                    disabled={disabled}
                    onUserInput={(v) => setLocalPrice(v)}
                    className={`text-left border-none text-xl font-bold p-0`}
                    placeholder={"0.0"}
                    maxDecimals={limitOrderType === LimitOrderDirection.SELL ? otherCurrency?.decimals : currency?.decimals}
                />
                <div className="flex gap-2">
                    <Button
                        variant={'outline'}
                        size={"icon"}
                        className="w-6 h-6 bg-card-dark rounded-full border border-card-border"
                        disabled={plusDisabled || disabled}
                        onClick={() => tickStep(1)}
                    >
                        +
                    </Button>
                    <Button
                        variant={'outline'}
                        size={"icon"}
                        className="w-6 h-6 bg-card-dark rounded-full border border-card-border"
                        disabled={minusDisabled || disabled}
                        onClick={() => tickStep(-1)}
                    >
                        -
                    </Button>
                </div>
            </div>
        </div>
    );
};
