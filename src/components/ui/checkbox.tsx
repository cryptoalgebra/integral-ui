import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/utils/common/cn";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(({ className, onCheckedChange, checked, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        onCheckedChange?.(isChecked);
        onChange?.(event);
    };

    return (
        <div className="relative inline-flex items-center">
            <input type="checkbox" className="sr-only" ref={ref} checked={checked} onChange={handleChange} {...props} />
            <div
                className={cn(
                    "h-4 w-4 rounded border-2 border-border bg-background transition-colors duration-200 cursor-pointer",
                    "hover:border-primary/60",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    checked && "bg-primary border-primary",
                    props.disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
                onClick={() => {
                    if (!props.disabled) {
                        const newChecked = !checked;
                        onCheckedChange?.(newChecked);
                    }
                }}
            >
                {checked && <Check className="h-3 w-3 text-primary-foreground absolute top-0.5 left-0.5" />}
            </div>
        </div>
    );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };
