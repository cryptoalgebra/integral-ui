import { Button } from "@/components/ui/button";
import ALMModule from "@/modules/ALMModule";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { enabledModules } from "config/app-modules";
import { CreateManualPosition } from "./CreateManualPosition";

const { useALMVaultsByPool } = ALMModule.hooks;
const { CreateAutomatedPosition } = ALMModule.components;

interface CreatePositionFlowProps {
    poolAddress?: Address;
    handleCloseModal?: () => void;
    mode?: "page" | "modal";
}

export function CreatePositionFlow({ poolAddress, handleCloseModal, mode = "page" }: CreatePositionFlowProps) {
    const [isALM, setIsALM] = useState<boolean | null>(null);

    const isALMPool = true;

    const { vaults } = useALMVaultsByPool(isALMPool ? poolAddress : undefined);

    useEffect(() => {
        if (vaults && vaults.length > 0) {
            setIsALM(false);
        }
    }, [vaults]);

    const toggleWrapperClassName = mode === "modal" ? "mb-4 flex justify-start" : "mb-3 w-full";

    const toggleCardClassName =
        mode === "modal"
            ? "inline-flex w-full items-center gap-2 rounded-[20px] border border-border bg-card p-2 sm:w-fit"
            : "flex items-center h-full max-h-16 col-span-1 p-2 bg-card rounded-xl justify-between gap-2 border border-card-border";

    const manualVariant = mode === "modal" ? (isALM ? "icon" : "ghostActive") : isALM ? "ghost" : "primaryLink";
    const automatedVariant = mode === "modal" ? (!isALM ? "icon" : "ghostActive") : !isALM ? "ghost" : "primaryLink";
    const toggleButtonClassName =
        mode === "modal"
            ? "h-11 w-full rounded-2xl px-5 text-sm font-medium normal-case tracking-normal sm:min-w-[144px]"
            : "flex items-center justify-center gap-2 w-full rounded-lg h-12";

    return (
        <>
            {isALMPool && enabledModules.ALMModule ? (
                <div className={toggleWrapperClassName}>
                    <div className={toggleCardClassName}>
                        <Button onClick={() => setIsALM(false)} size={"md"} variant={manualVariant} className={toggleButtonClassName}>
                            Manually
                        </Button>
                        <Button
                            onClick={() => setIsALM(true)}
                            size={"md"}
                            disabled={isALM === null}
                            variant={automatedVariant}
                            className={toggleButtonClassName}
                        >
                            Automated
                        </Button>
                    </div>
                </div>
            ) : null}

            {isALM ? (
                <CreateAutomatedPosition poolId={poolAddress} vaults={vaults} />
            ) : (
                <CreateManualPosition poolAddress={poolAddress} handleCloseModal={handleCloseModal} />
            )}
        </>
    );
}
