import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CreateManualPosition } from "./CreateManualPosition";
import { Address } from "viem";
import { enabledModules } from "config/app-modules";
import ALMModule from "@/modules/ALMModule";
import { cn } from "@/utils";

const { useALMVaultsByPool } = ALMModule.hooks;
const { CreateAutomatedPosition } = ALMModule.components;

type NewPositionPageParams = Record<"pool", Address>;

const NewPositionPage = () => {
    const [isALM, setIsALM] = useState<boolean | null>(null);

    const { pool: poolAddress } = useParams<NewPositionPageParams>();

    // const chainId = useChainId();
    // const { infoClient } = useClients();

    // const { data, loading: isCustomPoolDeployerLoading } = useCustomPoolDeployerQuery({
    //     variables: { poolId: poolAddress as string },
    //     skip: !poolAddress,
    //     client: infoClient,
    // });

    const isALMPool = true;

    const { vaults } = useALMVaultsByPool(isALMPool ? poolAddress : undefined);

    useEffect(() => {
        if (vaults && vaults.length > 0) {
            setIsALM(false);
        }
    }, [vaults]);

    const modeSwitch = isALMPool && enabledModules.ALMModule && (
        <div className="relative flex w-full overflow-hidden rounded-xl bg-card-light">
            <button
                type="button"
                onClick={() => setIsALM(false)}
                className={cn(
                    "flex h-12 w-full items-center justify-center px-6 text-sm font-medium transition-colors",
                    isALM ? "text-text-300 hover:text-text-100" : "bg-card-border/40 text-text-100",
                )}
            >
                Manual
            </button>
            <button
                type="button"
                onClick={() => setIsALM(true)}
                disabled={isALM === null}
                className={cn(
                    "flex h-12 w-full items-center justify-center px-6 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
                    isALM ? "bg-card-border/40 text-text-100" : "text-text-300 hover:text-text-100",
                )}
            >
                Automated
            </button>
        </div>
    );

    return (
        <PageContainer>
            <div className="w-full grid grid-flow-col auto-cols-fr gap-3 max-md:flex-col max-md:flex mb-3">
                <div className="col-span-2 mb-8">
                    <PageTitle title={"Create Position"} showSettings={false} />
                </div>
            </div>
            {isALM ? (
                <CreateAutomatedPosition poolId={poolAddress} vaults={vaults} modeSwitch={modeSwitch} />
            ) : (
                <CreateManualPosition poolAddress={poolAddress} modeSwitch={modeSwitch} />
            )}
        </PageContainer>
    );
};

export default NewPositionPage;
