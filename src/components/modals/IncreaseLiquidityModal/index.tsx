import AmountsSection from "@/components/create-position/AmountsSection";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IDerivedMintInfo } from "@/state/mintStore";
import { Currency } from "@cryptoalgebra/custom-pools-sdk";
import { useState } from "react";

interface IncreaseLiquidityModalProps {
    tokenId: number;
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    mintInfo: IDerivedMintInfo;
}

export function IncreaseLiquidityModal({ tokenId, currencyA, currencyB, mintInfo }: IncreaseLiquidityModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleCloseModal = () => {
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={"primaryLink"} disabled={false} className="whitespace-nowrap w-full">
                    Add Liquidity
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] rounded-xl! bg-card">
                <DialogHeader>
                    <DialogTitle className="font-bold select-none mt-2 max-md:mx-auto">Enter Amounts</DialogTitle>
                </DialogHeader>
                <AmountsSection
                    handleCloseModal={handleCloseModal}
                    tokenId={tokenId}
                    currencyA={currencyA}
                    currencyB={currencyB}
                    mintInfo={mintInfo}
                />
            </DialogContent>
        </Dialog>
    );
}
