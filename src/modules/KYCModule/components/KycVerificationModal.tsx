import Loader from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppKit } from "@reown/appkit/react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAccount, useChainId } from "wagmi";
import { KycIdentityState, KycStatus } from "../types";
import { useKycActions } from "../hooks";

interface KycVerificationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    identity: KycIdentityState;
    onStatusChange?: () => void;
}

export const KycVerificationModal = ({ open, onOpenChange, identity, onStatusChange }: KycVerificationModalProps) => {
    const actions = useKycActions(identity, onStatusChange);
    const { open: openWalletModal } = useAppKit();
    const { resetSession } = actions;
    const { address: account } = useAccount();
    const chainId = useChainId();
    const contextRef = useRef({ account, chainId });

    useEffect(() => {
        if (!open) {
            resetSession();
        }
    }, [open, resetSession]);

    useEffect(() => {
        const contextChanged = contextRef.current.account !== account || contextRef.current.chainId !== chainId;
        contextRef.current = { account, chainId };

        if (open && contextChanged) onOpenChange(false);
    }, [account, chainId, onOpenChange, open]);

    const isBusy = actions.isDeploying || actions.isAddingClaim || actions.isRemovingClaim;

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !isBusy && onOpenChange(nextOpen)}>
            <DialogContent className="max-w-[500px] rounded-2xl! bg-card">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-left">Demo KYC verification</DialogTitle>
                    <DialogDescription className="text-left text-text-300">Creates the verified Onchain ID</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3">
                    <Step
                        step={1}
                        title="Deploy Onchain ID"
                        description="Create the Identity contract controlled by your wallet."
                        done={Boolean(identity.identityAddress)}
                        active={identity.status === KycStatus.IDENTITY_REQUIRED}
                    />
                    <Step
                        step={2}
                        title="Add verification claim"
                        description="Validate the onchain identity. This step is automatic in the demo."
                        done={identity.status === KycStatus.VERIFIED}
                        active={identity.status === KycStatus.CLAIM_REQUIRED || identity.status === KycStatus.INVALID_CLAIM}
                    />

                    {(identity.configError || actions.error) && (
                        <div className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
                            <AlertTriangle className="mt-0.5 shrink-0" size={16} />
                            <span className="break-words">{actions.error || identity.configError}</span>
                        </div>
                    )}

                    {!account ? (
                        <Button variant="primary" onClick={() => openWalletModal()}>
                            Connect Wallet
                        </Button>
                    ) : identity.status === KycStatus.CHECKING ? (
                        <Button disabled>
                            <Loader />
                        </Button>
                    ) : identity.status === KycStatus.IDENTITY_REQUIRED ? (
                        <Button variant="primary" onClick={actions.deployIdentity} disabled={isBusy || Boolean(identity.configError)}>
                            {actions.isDeploying ? <Loader /> : "Deploy Onchain ID"}
                        </Button>
                    ) : identity.status === KycStatus.CLAIM_REQUIRED || identity.status === KycStatus.INVALID_CLAIM ? (
                        <Button variant="primary" onClick={actions.addClaim} disabled={isBusy || Boolean(identity.configError)}>
                            {actions.isAddingClaim ? (
                                <Loader />
                            ) : identity.status === KycStatus.INVALID_CLAIM ? (
                                "Replace invalid claim"
                            ) : (
                                "Complete verification"
                            )}
                        </Button>
                    ) : identity.status === KycStatus.VERIFIED ? (
                        <>
                            <div className="flex items-center gap-2 rounded-xl border border-green-400/30 bg-green-400/10 p-3 text-sm text-green-300">
                                <CheckCircle2 size={17} /> Your Identity has a valid KYC verification.
                            </div>
                            <Button variant="destructive" className="w-full" onClick={actions.removeClaim} disabled={isBusy}>
                                {actions.isRemovingClaim ? <Loader /> : "Remove claim"}
                            </Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => identity.refetch()} disabled={identity.isLoading}>
                            {identity.isLoading ? <Loader /> : "Retry status check"}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const Step = ({
    title,
    description,
    done,
    active,
    step,
}: {
    title: string;
    description: string;
    done: boolean;
    active: boolean;
    step: number;
}) => (
    <div className={`flex items-start gap-3 rounded-xl border p-3 ${active ? "border-cyan-300/30 bg-cyan-300/10" : "border-card-border"}`}>
        <span className={done ? "text-green-300" : active ? "text-cyan-300" : "text-text-300"}>
            {done ? <CheckCircle2 size={18} /> : step}
        </span>
        <div className="text-left">
            <p className="text-sm font-semibold text-text-100">{title}</p>
            <p className="text-xs text-text-300">{description}</p>
        </div>
    </div>
);
