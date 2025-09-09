import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/common/cn";

const buttonVariants = cva(
    "inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary: "bg-primary-gradient text-primary-foreground hover:opacity-85",
                primaryLink: "bg-primary-800 border border-primary-200 hover:opacity-65",
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                action: "bg-primary-button text-primary-foreground font-bold hover:bg-primary-button/80",
                destructive: "bg-destructive-gradient text-destructive-foreground hover:bg-destructive/80 font-semibold hover:opacity-85",
                outline: "border hover:bg-card-hover",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                ghost: "hover:bg-card-hover",
                link: "text-primary-200 underline-offset-4 hover:underline",
                icon: "font-semibold hover:bg-card-hover",
                iconActive: "font-semibold bg-primary-800 border border-primary",
                iconHover: "font-semibold bg-card-hover",
                ghostActive: "bg-gradient-to-r from-primary-100 to-accent-100 hover:bg-bg-100 text-white",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-lg px-3",
                md: "h-6 rounded-lg p-4 py-6",
                lg: "rounded-2xl text-md p-4",
                icon: "h-10 w-10 rounded-xl",
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
