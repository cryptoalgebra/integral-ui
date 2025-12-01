import { useCallback, useEffect, useState } from "react";
import { Currency, Price } from "@cryptoalgebra/custom-pools-sdk";
import { useMintState } from "@/state/mintStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface RangeSelectorPartProps {
    value: string;
    onUserInput: (value: string) => void;
    decrement: () => string;
    increment: () => string;
    decrementDisabled?: boolean;
    incrementDisabled?: boolean;
    label?: string;
    width?: string;
    locked?: boolean;
    initialPrice: Price<Currency, Currency> | undefined;
    disabled: boolean;
    title: string;
}

const RangeSelectorPart = ({
    value,
    decrement,
    increment,
    decrementDisabled = false,
    incrementDisabled = false,
    locked,
    onUserInput,
    disabled,
    title,
}: RangeSelectorPartProps) => {
    const [localUSDValue, setLocalUSDValue] = useState("");
    const [localTokenValue, setLocalTokenValue] = useState("");

    const {
        initialTokenPrice,
        actions: { updateSelectedPreset },
    } = useMintState();

    const handleOnBlur = useCallback(() => {
        onUserInput(localTokenValue);
    }, [localTokenValue, localUSDValue, onUserInput]);

    const handleDecrement = useCallback(() => {
        onUserInput(decrement());
    }, [decrement, onUserInput]);

    const handleIncrement = useCallback(() => {
        onUserInput(increment());
    }, [increment, onUserInput]);

    useEffect(() => {
        if (value) {
            setLocalTokenValue(value);
            if (value === "∞") {
                setLocalUSDValue(value);
                return;
            }
        } else if (value === "") {
            setLocalTokenValue("");
            setLocalUSDValue("");
        }
    }, [initialTokenPrice, value]);

    useEffect(() => {
        return () => updateSelectedPreset(null);
    }, []);

    return (
        <div>
            <div className="font-bold text-xs mb-3 text-text-100/75">{title.toUpperCase()}</div>
            <div className="flex relative">
                <Button
                    variant={"ghost"}
                    size={"sm"}
                    onClick={handleDecrement}
                    disabled={decrementDisabled || disabled}
                    className="border rounded-xl rounded-r-none"
                >
                    -
                </Button>

                <Input
                    type={"text"}
                    value={localTokenValue}
                    id={title}
                    onBlur={handleOnBlur}
                    disabled={disabled || locked}
                    onUserInput={(v) => {
                        setLocalTokenValue(v);
                        updateSelectedPreset(null);
                    }}
                    placeholder={"0.00"}
                    className="w-full bg-card-hover border-y border-card-border border-x-0 rounded-none text-sm h-[36px]"
                />

                <Button
                    variant={"ghost"}
                    size={"sm"}
                    onClick={handleIncrement}
                    disabled={incrementDisabled || disabled}
                    className="border rounded-xl rounded-l-none"
                >
                    +
                </Button>
            </div>
        </div>
    );
};

export default RangeSelectorPart;
