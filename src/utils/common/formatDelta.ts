type Nullish<T> = T | null | undefined;

export function formatDelta(delta: Nullish<number>) {
    if (delta === null || delta === undefined || delta === Infinity || Number.isNaN(delta)) {
        return "-";
    }

    return `${Number(Math.abs(delta).toFixed(2)).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: false,
    })}%`;
}
