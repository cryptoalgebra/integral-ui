import { delay } from "./delay";

export async function poll(fn: () => Promise<unknown>, interval: number = 2_000, duration: number = 10_000): Promise<void> {
    const end = Date.now() + duration;

    while (Date.now() < end) {
        await fn();
        await delay(interval);
    }
}
