import { formatFutureTime } from "@/utils/common/formatDate";
import { useEffect, useState } from "react";

type LiveChipProps = {
    showDot?: boolean;
    targetDate?: string | number | Date;
};

export function LiveChip({ showDot = false, targetDate }: LiveChipProps) {
    const [timeLeft, setTimeLeft] = useState(new Date(targetDate || 0).getTime() - Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(new Date(targetDate || 0).getTime() - Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="w-fit inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 text-white text-sm font-medium">
            {showDot && (
                <>
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-600"></span>
                    </span>

                    <span className="uppercase tracking-wide text-green-400">Live</span>
                </>
            )}

            {targetDate && (
                <span className="flex gap-2">
                    <span>Ends in</span>
                    <span>{formatFutureTime(timeLeft)}</span>
                </span>
            )}
        </div>
    );
}
