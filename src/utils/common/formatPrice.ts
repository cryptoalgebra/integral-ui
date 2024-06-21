import { formatCurrency } from "./formatCurrency";

export function formatPrice(price: string, decimals: number) {
    const amountNum = Number(price);
    const minAmount = 1 / 10 ** (decimals || 3);

    if (amountNum === 0) return "0";
    if (amountNum < minAmount) return `< ${minAmount}`;

    if (amountNum < 1) {
        const amountInt = price.split(".")[0];
        const amountDecimals = price.split(".")[1]?.slice(0, decimals);
        return amountDecimals ? `${amountInt}.${amountDecimals}` : amountInt;
    }

    if (amountNum < 100) {
        const amountInt = price.split(".")[0];
        const amountDecimals = price.split(".")[1]?.slice(0, 2);
        return amountDecimals ? `${amountInt}.${amountDecimals}` : amountInt;
    }

    if (amountNum < 10000) return price.split(".")[0];

    if (amountNum < 1000000000000000) return formatCurrency.format(Math.floor(amountNum * 100) / 100);

    return "> 100T";
}
