import { useState, useEffect, useMemo } from "react";
import { cn } from "@/utils/common/cn";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { VeTOKEN } from "../../types";
import { formatAmount } from "@/utils";
import { formatEther } from "viem";
import { Skeleton } from "@/components/ui/skeleton";

interface LockSelectorProps {
    veTOKENsList: VeTOKEN[] | undefined;
    isLoading: boolean;
    selectedTokenId: number | undefined;
    onSelect: (tokenId: number | undefined) => void;
}

export const LockSelector = ({ veTOKENsList, isLoading, selectedTokenId, onSelect }: LockSelectorProps) => {
    const [open, setOpen] = useState(false);

    const selectedVeTOKEN = useMemo(() => veTOKENsList?.find((vk) => vk.tokenId.toString() === selectedTokenId?.toString()), [
        veTOKENsList,
        selectedTokenId,
    ]);

    useEffect(() => {
        if (veTOKENsList && veTOKENsList.length > 0 && !selectedTokenId) {
            onSelect(Number(veTOKENsList[0].tokenId));
        }
    }, [veTOKENsList, selectedTokenId]);

    if (isLoading) {
        return <Skeleton className="w-50 h-10" />;
    }

    if (!veTOKENsList || veTOKENsList.length === 0) {
        return (
            <Link to="/vetoken" className="w-full sm:w-fit">
                <Button variant="default" className="w-full rounded-lg min-w-50 h-10 whitespace-nowrap">
                    Lock TOKEN to start voting
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
                        <span className="text-text-200">Select a veTOKEN lock</span>
                    )}
                    <div className="flex gap-x-1 items-center">
                        {selectedVeTOKEN && (
                            <span className="text-sm font-medium text-muted-foreground">
                                {formatAmount(formatEther(selectedVeTOKEN.balance))} veTOKEN
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
                {veTOKENsList.map((veTOKEN) => {
                    const isSelected = veTOKEN.tokenId.toString() === selectedTokenId?.toString();
                    return (
                        <button
                            key={veTOKEN.tokenId.toString()}
                            onClick={() => {
                                if (!isSelected) onSelect(Number(veTOKEN.tokenId));
                                setOpen(false);
                            }}
                            className={cn(
                                "flex w-full items-center justify-between px-4 py-3 h-10 text-sm hover:bg-card-hover transition-colors",
                                isSelected && "bg-card-hover font-medium"
                            )}
                        >
                            <span>#{veTOKEN.tokenId.toString()}</span>
                            <span>{formatAmount(formatEther(veTOKEN.balance))} veTOKEN</span>
                        </button>
                    );
                })}
            </PopoverContent>
        </Popover>
    );
};
