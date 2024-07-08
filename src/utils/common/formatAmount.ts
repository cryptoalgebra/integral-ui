import { formatCurrency } from "./formatCurrency";

export function formatAmount(amount: string, decimals = 3): string {
    const amountNum = Number(amount);
    const minAmount = 1 / 10 ** (decimals || 3);

    if (amountNum === 0) return "0";
    if (amountNum < minAmount) return `< ${minAmount}`;

    if (amountNum < 1) {
        const rounded = (Math.floor(amountNum / minAmount) * minAmount).toFixed(decimals);
        return parseFloat(rounded).toString();
    }
    
    if (amountNum < 100) return (Math.floor(amountNum * 100) / 100).toString();
    if (amountNum < 10000) return Math.floor(amountNum).toString();

    if (amountNum < 1000000000000000) return formatCurrency.format(Math.floor(amountNum * 100) / 100);

    return "∞";
}

export function reverseFormatAmount(formattedNumber: string): number {
    const suffixes: { [key: string]: number } = {
        K: 1e3,
        M: 1e6,
        B: 1e9,
        T: 1e12,
    };

    const suffix = formattedNumber.slice(-1);
    const value = parseFloat(formattedNumber.slice(0, -1));

    if (formattedNumber.startsWith("< ") || formattedNumber.startsWith("> ")) {
        const value = parseFloat(formattedNumber.slice(2));
        return value > 0 ? value : 0;
    }

    if (suffixes[suffix]) {
        return value * suffixes[suffix];
    } else {
        return parseFloat(formattedNumber);
    }
}
