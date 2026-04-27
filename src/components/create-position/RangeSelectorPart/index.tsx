import { useCallback, useEffect, useState } from "react";
import { Currency, Price } from "@cryptoalgebra/integral-sdk";
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
    const [localTokenValue, setLocalTokenValue] = useState("");

    const {
        initialTokenPrice,
        actions: { updateSelectedPreset },
    } = useMintState();

    const handleOnBlur = useCallback(() => {
        onUserInput(localTokenValue);
    }, [localTokenValue, onUserInput]);

    const handleDecrement = useCallback(() => {
        onUserInput(decrement());
    }, [decrement, onUserInput]);

    const handleIncrement = useCallback(() => {
        onUserInput(increment());
    }, [increment, onUserInput]);

    useEffect(() => {
        if (value) {
            setLocalTokenValue(value);
        } else if (value === "") {
            setLocalTokenValue("");
        }
    }, [initialTokenPrice, value]);

    useEffect(() => {
        return () => updateSelectedPreset(null);
    }, []);

    return (
        <div className="">
            <div className="text-xs text-text ">{title}</div>

            <div className="mt-1 flex items-center gap-0">
                <Button
                    variant={"outline"}
                    size={"icon"}
                    onClick={handleDecrement}
                    disabled={decrementDisabled || disabled}
                    className="h-10 w-10 border-border border-r-0 bg-card rounded-none rounded-l-md"
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
                    className="h-10 flex-1 border-border z-10 rounded-none text-center font-medium text-text text-sm"
                />

                <Button
                    variant={"outline"}
                    size={"icon"}
                    onClick={handleIncrement}
                    disabled={incrementDisabled || disabled}
                    className="h-10 w-10 border-border bg-card border-l-0 rounded-none rounded-r-md"
                >
                    +
                </Button>
            </div>
        </div>
    );
};

export default RangeSelectorPart;
