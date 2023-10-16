import * as React from "react"

import { cn } from "@/lib/utils"

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`);
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onUserInput?: (value: string) => void;
  maxDecimals?: number
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onUserInput, maxDecimals = 18, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onChange={e => {
          let value = e.target.value.replace(/,/g, ".")
          value = value.indexOf(".") >= 0 ? value.slice(0, value.indexOf(".") + maxDecimals) : value
          if (value === "" || inputRegex.test(value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))) {
            onUserInput && onUserInput(value)
          }
        }}
        inputMode={'decimal'}
        pattern="^[0-9]*[.,]?[0-9]*$"
        minLength={1}
        maxLength={100}
        spellCheck="false"
        autoComplete="off"
        autoCorrect="off"
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
