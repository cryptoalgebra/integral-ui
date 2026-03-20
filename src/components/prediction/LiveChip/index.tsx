import { useEffect, useState } from "react";

type LiveChipProps = {
  targetDate: string | number | Date;
};

function formatTime(ms: number) {
    if (ms <= 0) return "0m";
  
    const totalSeconds = Math.floor(ms / 1000);
  
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  
    const parts = [];
  
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
  
    return parts.join(" ");
}

export default function LiveChip({ targetDate }: LiveChipProps) {
  const [timeLeft, setTimeLeft] = useState(
    new Date(targetDate).getTime() - Date.now()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(new Date(targetDate).getTime() - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="w-fit inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 text-white text-sm font-medium">
      
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
      </span>

      <span className="uppercase tracking-wide text-red-400">
        Live
      </span>

      <span className="flex gap-2">
        <span>Ends in</span>
        <span>{formatTime(timeLeft)}</span>
      </span>
    </div>
  );
}