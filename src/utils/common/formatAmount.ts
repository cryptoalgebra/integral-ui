import { formatCurrency } from "./formatCurrency";

export function formatAmount(amount: string, decimals = 3): string {
    const amountNum = Number(amount);
    const minAmount = 1 / 10 ** (decimals || 3);

    if (amountNum === 0) return "0";

    if (amountNum < minAmount) return `< ${minAmount}`;

    if (amountNum < 1) return (Math.floor(amountNum / minAmount) * minAmount).toFixed(decimals);

    if (amountNum < 100) return (Math.floor(amountNum * 100) / 100).toString();

    if (amountNum < 10000) return Math.floor(amountNum).toString();

    if (amountNum < 1000000000000) return formatCurrency.format(Math.floor(amountNum * 100) / 100);

    return "∞";
}
