import { formatUnits } from "viem";

export function PredictionParams({ amountToWin }: { amountToWin: bigint }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 bg-card-light rounded-xl">
            <span className="text-sm text-text-300">Potential Return</span>
            <span className="text-3xl font-bold text-green-400">${formatUnits(amountToWin, 6)}</span>
        </div>
    );
}
