import { cn } from "@/utils";
import { formatUnits } from "viem";

interface IPredictionSideSelector {
    side: "yes" | "no";
    setSide: (side: "yes" | "no") => void;
    priceYes?: bigint;
    priceNo?: bigint;
}

export function PredictionSideSelector({ priceYes, priceNo, side, setSide }: IPredictionSideSelector) {
    const formattedpriceYes = priceYes ? (Number(formatUnits(priceYes, 18)) * 100).toFixed(2) : 0;
    const formattedNoPrice = priceNo ? (Number(formatUnits(priceNo, 18)) * 100).toFixed(2) : 0;

    return (
        <div className="grid grid-cols-2 gap-2">
            <button
                onClick={() => setSide("yes")}
                className={cn(
                    "py-4 rounded-full text-sm font-semibold transition-all duration-200",
                    side === "yes" ? "bg-green-600 text-white" : "bg-card-light text-text-200 hover:bg-card-light/90",
                )}
            >
                <span className="mr-1.5">YES</span>
                <span className="opacity-70">{formattedpriceYes}%</span>
            </button>
            <button
                onClick={() => setSide("no")}
                className={cn(
                    "py-4 rounded-full text-sm font-semibold transition-all duration-200",
                    side === "no" ? "bg-red-600 text-white" : "bg-card-light text-text-200 hover:bg-card-light/90",
                )}
            >
                <span className="mr-1.5">NO</span>
                <span className="opacity-70">{formattedNoPrice}%</span>
            </button>
        </div>
    );
}
