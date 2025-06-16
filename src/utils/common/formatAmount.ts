export function formatAmount(amount: string | number, decimals = 3): string {
    const amountNum = Number(amount);
    const isNegative = amountNum < 0;
    const absAmount = Math.abs(amountNum);
    const minAmount = 1 / 10 ** decimals;

    if (absAmount === 0) return "0";
    if (absAmount < minAmount) return `${isNegative ? "-<" : "<"} ${minAmount}`;
    if (absAmount < 1)
        return `${isNegative ? "-" : ""}${Number((Math.floor(absAmount / minAmount) * minAmount).toFixed(decimals)).toString()}`;
    if (absAmount < 1_000)
        return `${isNegative ? "-" : ""}${(Math.floor(absAmount * 100) / 100).toLocaleString("en-us", {
            maximumFractionDigits: 2,
        })}`;
    if (absAmount < 100_000_000)
        return `${isNegative ? "-" : ""}${Math.floor(absAmount).toLocaleString("en-us", {
            maximumFractionDigits: 0,
        })}`;
    if (absAmount < 1 * 10 ** 18)
        return `${isNegative ? "-" : ""}${Math.floor(absAmount).toLocaleString("en-us", {
            notation: "compact",
            maximumFractionDigits: 0,
        })}`;

    return isNegative ? "-∞" : "∞";
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
