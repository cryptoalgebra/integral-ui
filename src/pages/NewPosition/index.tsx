import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CreateManualPosition } from "./CreateManualPosition";
import { Address } from "viem";
import { enabledModules } from "config/app-modules";
import ALMModule from "@/modules/ALMModule";
import { useCustomPoolDeployerQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { CUSTOM_POOL_DEPLOYER_ADDRESSES } from "config/custom-pool-deployer";
import { useChainId } from "wagmi";

const { useALMVaultsByPool } = ALMModule.hooks;
const { CreateAutomatedPosition } = ALMModule.components;

type NewPositionPageParams = Record<"pool", Address>;

const NewPositionPage = () => {
    const [isALM, setIsALM] = useState<boolean | null>(null);

    const { pool: poolAddress } = useParams<NewPositionPageParams>();

    const chainId = useChainId();
    const { infoClient } = useClients();

    const { data, loading: isCustomPoolDeployerLoading } = useCustomPoolDeployerQuery({
        variables: { poolId: poolAddress as string },
        skip: !poolAddress,
        client: infoClient,
    });

    const isALMPool =
        data?.pool?.deployer && CUSTOM_POOL_DEPLOYER_ADDRESSES.ALM[chainId]
            ? data.pool.deployer.toLowerCase() === CUSTOM_POOL_DEPLOYER_ADDRESSES.ALM[chainId].toLowerCase()
            : false;

    const { vaults } = useALMVaultsByPool(isALMPool ? poolAddress : undefined);

    useEffect(() => {
        if (vaults && vaults.length > 0) {
            setIsALM(false);
        }
    }, [vaults]);

    return (
        <PageContainer>
            <div className="w-full grid grid-flow-col auto-cols-fr gap-3 max-md:flex-col max-md:flex mb-3">
                <div className="col-span-2 mb-8">
                    <PageTitle title={"Create Position"} showSettings={false} />
                </div>
                {!isCustomPoolDeployerLoading && isALMPool && enabledModules.ALMModule && (
                    <div className="flex items-center h-full max-h-16 col-span-1 p-2 bg-card rounded-xl justify-between gap-2 border border-card-border">
                        <Button
                            onClick={() => setIsALM(false)}
                            size={"md"}
                            variant={isALM ? "ghost" : "primaryLink"}
                            className="flex items-center justify-center gap-2 w-full rounded-lg h-12"
                        >
                            Manually
                        </Button>
                        <Button
                            onClick={() => setIsALM(true)}
                            size={"md"}
                            disabled={isALM === null}
                            variant={!isALM ? "ghost" : "primaryLink"}
                            className="flex items-center justify-center gap-2 w-full rounded-lg h-12"
                        >
                            Automated
                        </Button>
                    </div>
                )}
            </div>
            {isALM ? <CreateAutomatedPosition poolId={poolAddress} vaults={vaults} /> : <CreateManualPosition poolAddress={poolAddress} />}
        </PageContainer>
    );
};

export default NewPositionPage;
