import { useState, useEffect, useRef } from "react";

interface CountdownResult {
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isExpired: boolean;
    formatted: string;
}

export function useCountdown(endTimestamp: number): CountdownResult {
    const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Update every second
        intervalRef.current = setInterval(() => {
            setNow(Math.floor(Date.now() / 1000));
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const totalSeconds = Math.max(0, endTimestamp - now);
    const isExpired = totalSeconds <= 0;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    return {
        minutes,
        seconds,
        totalSeconds,
        isExpired,
        formatted,
    };
}
