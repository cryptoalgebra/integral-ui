import * as React from "react";

import { cn } from "@/utils/common/cn";

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onUserInput?: (value: string) => void;
    maxDecimals?: number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, onUserInput, maxDecimals = 18, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-md px-3 py-2 text-sm",
                "border border-card-border bg-card placeholder:text-muted-foreground",
                "transition-all duration-150",

                "focus-visible:outline-none",
                "focus-visible:ring-1 focus-visible:ring-ring",
                "focus-visible:border-card-border-focus",

                "disabled:cursor-not-allowed",
                className,
            )}
            ref={ref}
            onChange={(e) => {
                if (type === "text") {
                    onUserInput && onUserInput(e.target.value);
                }
                let value = e.target.value.replace(/,/g, ".");
                value = value.indexOf(".") >= 0 ? value.slice(0, value.indexOf(".") + maxDecimals + 1) : value;
                if (value === "" || inputRegex.test(value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))) {
                    onUserInput && onUserInput(value);
                }
            }}
            inputMode={"decimal"}
            pattern="^[0-9]*[.,]?[0-9]*$"
            minLength={1}
            maxLength={100}
            spellCheck="false"
            autoComplete="off"
            autoCorrect="off"
            {...props}
        />
    );
});
Input.displayName = "Input";

export { Input };
