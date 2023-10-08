import { useSwapState } from "@/state/swapStore";
import { LimitOrderDirection, LimitOrderDirectionType } from "@/types/limit-order-type";
import { Currency } from "@cryptoalgebra/integral-sdk";
import { useCallback, useEffect, useState } from "react";


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

const LimitPriceCard = ({ currency, otherCurrency, sellPrice, plusDisabled, minusDisabled, disabled, invertTick, setSellPrice, tickStep, setToMarketPrice }: LimitPriceCardProps) => {
    
    const [limitOrderType, setLimitOrderType] = useState<LimitOrderDirectionType>(LimitOrderDirection.SELL);

    const [localPrice, setLocalPrice] = useState("");

    const { actions: { limitOrderPriceFocused } } = useSwapState()

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

}

export default LimitPriceCard