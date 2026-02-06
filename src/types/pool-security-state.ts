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
    [SecurityState.ENABLED]: "bg-emerald-50 text-emerald-700 border-emerald-200",
    [SecurityState.DISABLED]: "bg-red-900 text-red-200 border-red-600",
    [SecurityState.BURN_ONLY]: "bg-amber-900 text-amber-200 border-amber-600",
};