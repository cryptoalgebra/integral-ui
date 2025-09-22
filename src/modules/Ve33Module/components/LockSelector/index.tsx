import { useState, useEffect, useMemo } from "react";
import { cn } from "@/utils/common/cn";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { VeALGB } from "../../types";
import { formatAmount } from "@/utils";
import { formatEther } from "viem";
import { Skeleton } from "@/components/ui/skeleton";

interface LockSelectorProps {
    veALGBsList: VeALGB[] | undefined;
    isLoading: boolean;
    selectedTokenId: number | undefined;
    onSelect: (tokenId: number | undefined) => void;
}

export const LockSelector = ({ veALGBsList, isLoading, selectedTokenId, onSelect }: LockSelectorProps) => {
    const [open, setOpen] = useState(false);

    const selectedVeALGB = useMemo(
        () => veALGBsList?.find((vk) => vk.tokenId.toString() === selectedTokenId?.toString()),
        [veALGBsList, selectedTokenId]
    );

    useEffect(() => {
        if (veALGBsList && veALGBsList.length > 0 && !selectedTokenId) {
            onSelect(Number(veALGBsList[0].tokenId));
        }
    }, [veALGBsList, selectedTokenId]);

    if (isLoading) {
        return <Skeleton className="w-50 h-10" />;
    }

    if (!veALGBsList || veALGBsList.length === 0) {
        return (
            <Link to="/vealgb" className="w-full sm:w-fit">
                <Button variant="default" className="w-full rounded-lg min-w-50 h-10 whitespace-nowrap">
                    Lock ALGB to start voting
                </Button>
            </Link>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="bg-card rounded-lg px-4 py-2 flex items-center gap-x-6 justify-between md:justify-start max-md:w-full"
                >
                    {selectedTokenId ? (
                        <div className="font-semibold">#{selectedTokenId.toString()}</div>
                    ) : (
                        <span className="text-text-200">Select a veALGB lock</span>
                    )}
                    <div className="flex gap-x-1 items-center">
                        {selectedVeALGB && (
                            <span className="text-sm font-medium text-muted-foreground">
                                {formatAmount(formatEther(selectedVeALGB.balance))} veALGB
                            </span>
                        )}
                        <ChevronDown className="size-5 text-text-200" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                side="bottom"
                align="start"
                className="p-0 min-w-56 overflow-y-auto w-auto bg-card border border-bg-300 rounded-lg"
            >
                {veALGBsList.map((veALGB) => {
                    const isSelected = veALGB.tokenId.toString() === selectedTokenId?.toString();
                    return (
                        <button
                            key={veALGB.tokenId.toString()}
                            onClick={() => {
                                if (!isSelected) onSelect(Number(veALGB.tokenId));
                                setOpen(false);
                            }}
                            className={cn(
                                "flex w-full items-center justify-between px-4 py-3 h-10 text-sm hover:bg-card-hover transition-colors",
                                isSelected && "bg-card-hover font-medium"
                            )}
                        >
                            <span>#{veALGB.tokenId.toString()}</span>
                            <span>{formatAmount(formatEther(veALGB.balance))} veALGB</span>
                        </button>
                    );
                })}
            </PopoverContent>
        </Popover>
    );
};
