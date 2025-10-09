import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Manage } from "./Manage";
import { Split } from "./Split";
import { Merge } from "./Merge";
import { Transfer } from "./Transfer";
import { useVeTOKENs } from "../../hooks";
import { VeTOKEN } from "../../types";

interface ManageLockModalProps {
    veTOKEN: VeTOKEN;
    children?: React.ReactNode;
    refetch?: () => void;
}

const views = ["Manage", "Split", "Merge", "Transfer"] as const;

export const ManageLockModal = ({ veTOKEN, children, refetch }: ManageLockModalProps) => {
    const [view, setView] = useState<typeof views[number]>("Manage");

    const { veTOKENs: veTOKENsList, isLoading: isVeTOKENsLoading } = useVeTOKENs();

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
                        {view} veTOKEN #{veTOKEN.tokenId.toString()}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-4 gap-1 p-1 border border-bg-300 rounded-lg">
                    {views.map((v) => (
                        <Button
                            key={v}
                            onClick={() => setView(v)}
                            disabled={isVeTOKENsLoading}
                            className="rounded-md"
                            variant={view === v ? "primaryLink" : "ghost"}
                            size={"sm"}
                        >
                            {v}
                        </Button>
                    ))}
                </div>

                <div className="w-full flex flex-col gap-3" hidden={view !== "Manage"}>
                    <Manage veTOKEN={veTOKEN} refetch={refetch} />
                </div>

                <div className="w-full flex flex-col gap-3" hidden={view !== "Split"}>
                    <Split veTOKEN={veTOKEN} refetch={refetch} />
                </div>

                <div className="w-full flex flex-col gap-3" hidden={view !== "Merge"}>
                    <Merge veTOKENsList={veTOKENsList} veTOKEN={veTOKEN} refetch={refetch} />
                </div>

                <div className="w-full flex flex-col gap-3" hidden={view !== "Transfer"}>
                    <Transfer veTOKEN={veTOKEN} refetch={refetch} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
