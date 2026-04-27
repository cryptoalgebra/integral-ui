import { UTCTimestamp } from "lightweight-charts";

interface BucketChartDataOptions {
    startTime?: number;
    endTime?: number;
    padStartWithFirstValue?: boolean;
}

export function bucketChartData(
    data: { time: number; value: number }[],
    bucketSizeSec: number,
    options: BucketChartDataOptions = {},
): { time: UTCTimestamp; value: number }[] {
    if (!data.length) return [];

    const sorted = [...data].sort((a, b) => a.time - b.time);

    const now = Math.floor(Date.now() / 1000);
    const rawStart = options.startTime ?? sorted[0].time;
    const rawEnd = options.endTime ?? now;
    const start = Math.floor(rawStart / bucketSizeSec) * bucketSizeSec;
    const end = Math.max(start, Math.ceil(rawEnd / bucketSizeSec) * bucketSizeSec);

    const buckets: { [bucketTime: number]: number | null } = {};
    for (let t = start; t <= end; t += bucketSizeSec) {
        buckets[t] = null;
    }

    let lastValue: number | null = options.padStartWithFirstValue ? sorted[0].value : null;
    let i = 0;
    const n = sorted.length;

    for (const t in buckets) {
        const bucketTime = Number(t);

        while (i < n && sorted[i].time <= bucketTime) {
            lastValue = sorted[i].value;
            i++;
        }

        if (lastValue !== null) {
            buckets[bucketTime] = lastValue;
        }
    }

    return Object.entries(buckets)
        .filter(([, value]) => value !== null)
        .map(([time, value]) => ({
            time: Number(time) as UTCTimestamp,
            value: value!,
        }));
}
