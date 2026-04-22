import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/common/cn";

const buttonVariants = cva(
    "inline-flex cursor-pointer gap-2 items-center justify-center rounded-xl text-sm font-medium text-text ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary: "bg-primary text-primary-foreground hover:bg-primary/80 tracking-[2px] uppercase",
                primaryLink: "border border-border bg-card hover:bg-panel",
                default: "bg-primary text-primary-foreground hover:bg-primary-hover",
                action: "bg-primary text-primary-foreground font-semibold hover:bg-primary-hover",
                destructive: "bg-accent text-primary-foreground hover:opacity-90",
                outline: "border border-border bg-card hover:bg-panel",
                secondary: "bg-panel text-secondary-foreground hover:bg-panel",
                ghost: "hover:bg-panel",
                link: "text-primary underline-offset-4 hover:text-primary-hover hover:underline",
                icon: "bg-card font-semibold hover:bg-panel",
                iconActive: "border border-border bg-panel font-semibold text-text",
                iconHover: "border border-border bg-panel font-semibold text-text hover:bg-panel",
                ghostActive: "border border-border bg-primary-soft text-text",
            },
            size: {
                default: "h-10 px-4 py-2 ",
                sm: "h-8 rounded-md px-3.5",
                md: "h-10 rounded-md px-4",
                lg: "h-12 rounded-lg px-5 text-md",
                icon: "h-10 w-10 rounded-lg",
            },
        },
        defaultVariants: {
            variant: "action",
            size: "lg",
        },
    }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
