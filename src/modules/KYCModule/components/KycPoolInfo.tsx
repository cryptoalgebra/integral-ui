import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Address } from "viem";
import { usePoolKycRequirement, useKycIdentity } from "../hooks";
import { KycStatus } from "../types";
import { KycTag } from "./KycTag";
import { KycVerificationModal } from "./KycVerificationModal";

export const KycPoolInfo = ({ poolAddress }: { poolAddress: Address }) => {
    const requirement = usePoolKycRequirement(poolAddress);
    const identity = useKycIdentity(requirement.isKycRequired);
    const [open, setOpen] = useState(false);

    if (requirement.isError) {
        return (
            <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-left">
                <p className="flex items-center gap-2 text-sm text-red-300">
                    <AlertTriangle size={16} /> Pool restrictions could not be checked.
                </p>
                <Button variant="outline" onClick={() => requirement.refetch()}>
                    Retry
                </Button>
            </div>
        );
    }

    if (!requirement.isKycRequired && !requirement.isLoading) return null;

    return (
        <>
            <div className="mb-3 w-full flex flex-col gap-3 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4 text-left md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-text-100">Restricted KYC pool</p>
                        <KycTag />
                    </div>
                    <p className="text-sm text-text-300">
                        Swaps and liquidity additions require an Onchain ID with a valid demo verification claim.
                    </p>
                </div>

                {requirement.isLoading ? (
                    <Button disabled className="md:w-fit">
                        <Loader />
                    </Button>
                ) : (
                    <Button
                        size="md"
                        variant={identity.status === KycStatus.VERIFIED ? "outline" : "primary"}
                        onClick={() => setOpen(true)}
                    >
                        {identity.status === KycStatus.VERIFIED
                            ? "Verified"
                            : identity.status === KycStatus.IDENTITY_REQUIRED
                            ? "Deploy Onchain ID"
                            : "Complete verification"}
                    </Button>
                )}
            </div>
            <KycVerificationModal open={open} onOpenChange={setOpen} identity={identity} />
        </>
    );
};
