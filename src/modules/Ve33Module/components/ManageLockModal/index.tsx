import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VeALGB } from "../../types";
import { Manage } from "./Manage";
import { Split } from "./Split";
import { Merge } from "./Merge";
import { Transfer } from "./Transfer";
import { useVeALGBs } from "../../hooks";

interface ManageLockModalProps {
    veALGB: VeALGB;
    children?: React.ReactNode;
    refetch?: () => void;
}

const views = ["Manage", "Split", "Merge", "Transfer"] as const;

export const ManageLockModal = ({ veALGB, children, refetch }: ManageLockModalProps) => {
    const [view, setView] = useState<typeof views[number]>("Manage");

    const { veALGBs: veALGBsList, isLoading: isVeALGBsLoading } = useVeALGBs();

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children ? (
                    children
                ) : (
                    <Button variant="outline" size="sm">
                        Manage
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-[550px] rounded-xl bg-card border border-bg-300">
                <DialogHeader>
                    <DialogTitle className="font-bold select-none">
                        {view} veALGB #{veALGB.tokenId.toString()}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-4 gap-1 p-1 border border-bg-300 rounded-lg">
                    {views.map((v) => (
                        <Button
                            key={v}
                            onClick={() => setView(v)}
                            disabled={isVeALGBsLoading}
                            className="rounded-md"
                            variant={view === v ? "ghostActive" : "ghost"}
                            size={"sm"}
                        >
                            {v}
                        </Button>
                    ))}
                </div>

                <div className="w-full flex flex-col gap-3" hidden={view !== "Manage"}>
                    <Manage veALGB={veALGB} refetch={refetch} />
                </div>

                <div className="w-full flex flex-col gap-3" hidden={view !== "Split"}>
                    <Split veALGB={veALGB} refetch={refetch} />
                </div>

                <div className="w-full flex flex-col gap-3" hidden={view !== "Merge"}>
                    <Merge veALGBsList={veALGBsList} veALGB={veALGB} refetch={refetch} />
                </div>

                <div className="w-full flex flex-col gap-3" hidden={view !== "Transfer"}>
                    <Transfer veALGB={veALGB} refetch={refetch} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
