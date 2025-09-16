function toSubscript(num: number): string {
    const map: Record<string, string> = {
        "0": "₀",
        "1": "₁",
        "2": "₂",
        "3": "₃",
        "4": "₄",
        "5": "₅",
        "6": "₆",
        "7": "₇",
        "8": "₈",
        "9": "₉",
    };
    return num
        .toString()
        .split("")
        .map((d) => map[d])
        .join("");
}

function formatTinyAmount(amount: number, decimals = 3): string {
    if (amount === 0) return "$0";

    if (amount < 0.001) {
        const parts = amount.toExponential().split("e-");
        const mantissa = parts[0].replace(".", "");
        const zeros = parseInt(parts[1], 10) - 1;

        return `0.0₍${toSubscript(zeros)}₎${mantissa.slice(0, decimals)}`;
    }

    return `$${amount.toLocaleString("en-US", {
        maximumFractionDigits: decimals,
    })}`;
}

export function formatAmount(amount: string | number, decimals = 3): string {
    const amountNum = Number(amount);
    const minAmount = 1 / 10 ** decimals;

    if (amountNum === 0) return "0";
    if (amountNum < minAmount) return `< ${minAmount}`;
    if (amountNum < 1e-6) return formatTinyAmount(amountNum);
    if (amountNum < 1) return Number((Math.floor(amountNum / minAmount) * minAmount).toFixed(decimals)).toString();
    if (amountNum < 1_000)
        return (Math.floor(amountNum * 100) / 100).toLocaleString("en-us", {
            maximumFractionDigits: 2,
        });
    if (amountNum < 100_000_000_000)
        return Math.floor(amountNum).toLocaleString("en-us", {
            maximumFractionDigits: 0,
        });

    if (amountNum < 1 * 10 ** 18)
        return Math.floor(amountNum).toLocaleString("en-us", {
            notation: "compact",
            maximumFractionDigits: 0,
        });

    return "∞";
}
