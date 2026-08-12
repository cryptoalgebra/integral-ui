import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";
import { Address } from "viem";
import { useKycIdentity, usePoolKycRequirement } from "../hooks";
import { KycStatus } from "../types";
import { KycVerificationModal } from "./KycVerificationModal";

export const KycActionGuard = ({ poolAddress, children }: { poolAddress?: Address; children: ReactNode }) => {
    const requirement = usePoolKycRequirement(poolAddress);
    const identity = useKycIdentity(requirement.isKycRequired);
    const [open, setOpen] = useState(false);

    if (!poolAddress) return <>{children}</>;
    if (requirement.isLoading) return <Button disabled><Loader /></Button>;
    if (requirement.isError)
        return (
            <Button variant="outline" onClick={() => requirement.refetch()}>
                Retry KYC check
            </Button>
        );
    if (!requirement.isKycRequired) return <>{children}</>;
    if (requirement.canAddLiquidity) return <>{children}</>;

    return (
        <>
            <Button
                variant="primary"
                onClick={() => setOpen(true)}
                disabled={identity.isLoading || identity.status === KycStatus.VERIFIED}
            >
                {identity.isLoading ? (
                    <Loader />
                ) : identity.status === KycStatus.IDENTITY_REQUIRED ? (
                    "Deploy Onchain ID"
                ) : identity.status === KycStatus.VERIFIED ? (
                    "KYC access required"
                ) : (
                    "Complete verification"
                )}
            </Button>
            <KycVerificationModal
                open={open}
                onOpenChange={setOpen}
                identity={identity}
                onStatusChange={() => void requirement.refetch()}
            />
        </>
    );
};
