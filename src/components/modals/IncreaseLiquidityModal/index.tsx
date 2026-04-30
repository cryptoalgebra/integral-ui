import AmountsSection from "@/components/create-position/AmountsSection";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { IDerivedMintInfo } from "@/state/mintStore";
import { Currency } from "@cryptoalgebra/integral-sdk";
import { useState } from "react";
import { Address } from "viem";

interface IncreaseLiquidityModalProps {
    tokenId: number;
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    mintInfo: IDerivedMintInfo;
    poolAddress: Address | undefined;
    onSuccess?: () => void;
}

export function IncreaseLiquidityModal({
    tokenId,
    currencyA,
    currencyB,
    mintInfo,
    onSuccess,
    poolAddress,
}: //   onSuccess,
IncreaseLiquidityModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSuccess = () => {
        onSuccess?.();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button disabled={false} size={"md"} variant={"primary"} className="whitespace-nowrap w-full gap-2 text-xs">
                    Add liquidity
                </Button>
            </DialogTrigger>
            <DialogContent size="md">
                <DialogHeader>Add Liquidity</DialogHeader>
                <div className="flex flex-col gap-4">
                    <AmountsSection
                        tokenId={tokenId}
                        currencyA={currencyA}
                        currencyB={currencyB}
                        mintInfo={mintInfo}
                        poolAddress={poolAddress}
                        onSuccess={handleSuccess}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
