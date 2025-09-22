import EnterAmountCard from "@/components/create-position/EnterAmountsCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMintActionHandlers, useMintState } from "@/state/mintStore";
import { tryParseAmount } from "@cryptoalgebra/custom-pools-sdk";
import { useState } from "react";
import { ExtendedVault } from "../../hooks";
import AddAutomatedLiquidityButton from "../AddAutomatedLiquidityButton";

interface AddALMLiquidityModalProps {
    vault: ExtendedVault | undefined;
}

export const AddALMLiquidityModal = ({ vault }: AddALMLiquidityModalProps) => {
    const { typedValue } = useMintState();
    const { onFieldAInput } = useMintActionHandlers(true);
    const parsedAmountA = tryParseAmount(typedValue, vault?.depositToken);

    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={'primary'} disabled={false} className="whitespace-nowrap w-full">
                    Add liquidity
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] rounded-xl! bg-card" style={{ borderRadius: "32px" }}>
                <DialogHeader>
                    <DialogTitle className="font-bold select-none mt-2 max-md:mx-auto">Enter Amounts</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col w-full h-fit gap-4">
                    <EnterAmountCard currency={vault?.depositToken} value={typedValue} handleChange={(value) => onFieldAInput(value)} />
                    <AddAutomatedLiquidityButton vault={vault} amount={parsedAmountA} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
