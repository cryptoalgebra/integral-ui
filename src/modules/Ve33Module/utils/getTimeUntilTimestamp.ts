export function getTimeUntilTimestamp(targetTimestamp: bigint | number) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const target = Number(targetTimestamp);
    let diff = Math.max(0, target - nowSeconds);

    const SECONDS_IN_DAY = 60 * 60 * 24;
    const SECONDS_IN_HOUR = 60 * 60;
    const SECONDS_IN_MINUTE = 60;

    const days = Math.floor(diff / SECONDS_IN_DAY);
    diff %= SECONDS_IN_DAY;

    const hours = Math.floor(diff / SECONDS_IN_HOUR);
    diff %= SECONDS_IN_HOUR;

    const minutes = Math.floor(diff / SECONDS_IN_MINUTE);
    const seconds = diff % SECONDS_IN_MINUTE;

    return { days, hours, minutes, seconds, display: `${days}d ${hours}h` };
}
