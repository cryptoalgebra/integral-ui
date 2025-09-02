import { cn } from "@/utils/common/cn";
import { FarmingPositionImg } from "..";

interface FarmingPositionCardProps {
    positionId: string;
    isALM: boolean;
    status: string;
    className?: string;
    onClick?: () => void;
    isDepositEligible: boolean;
}

export const FarmingPositionCard = ({ positionId, status, className, onClick, isDepositEligible, isALM }: FarmingPositionCardProps) => {
    return (
        <button
            disabled={!isDepositEligible}
            onClick={() => !isDepositEligible || onClick?.()}
            className={cn(
                "relative w-fit flex gap-4 p-4 bg-card-dark cursor-pointer hover:border-border rounded-xl border border-border/60  transition-all ease-in-out duration-200",
                className,
                !isDepositEligible ? "pointer-events-none" : ""
            )}
        >
            {!isDepositEligible && (
                <div className="absolute left-0 top-0 z-10 flex items-center text-sm justify-center w-full h-full bg-black/70 rounded-xl">
                    Unsupported range. <br /> Too narrow
                </div>
            )}

            <FarmingPositionImg isALM={isALM} positionId={positionId} size={12} />
            <div className="flex flex-col z-0">
                <p className="text-start ">Position #{positionId}</p>
                <div>
                    <div className={cn("flex gap-2 items-center", status === "In range" ? "text-green-300" : "text-red-300")}>
                        <div className={cn("w-2 h-2 rounded-full", status === "In range" ? "bg-green-300" : "bg-red-300")}></div>
                        <p className="text-sm">{status}</p>
                    </div>
                </div>
            </div>
        </button>
    );
};
