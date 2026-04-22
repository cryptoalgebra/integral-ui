import { SecurityState } from "@/hooks/pools/usePool";

export const STATUS_LABELS: Record<number, string> = {
    [SecurityState.ENABLED]: "Enabled",
    [SecurityState.DISABLED]: "Disabled",
    [SecurityState.BURN_ONLY]: "Burn Only",
};

export const STATUS_DESCRIPTIONS: Record<number, string> = {
    [SecurityState.ENABLED]: "All pool operations are allowed (swap, mint, burn, flash)",
    [SecurityState.DISABLED]: "All pool operations are blocked",
    [SecurityState.BURN_ONLY]: "Only liquidity withdrawals (burns) are allowed",
};

export const STATUS_COLORS: Record<number, string> = {
    [SecurityState.ENABLED]: "border-primary/20 bg-primary-soft text-text",
    [SecurityState.DISABLED]: "border-accent/25 bg-accent-soft text-text",
    [SecurityState.BURN_ONLY]: "border-primary/20 bg-panel text-text",
};
