import { Button } from "@/components/ui/button";
import { KycIdentityState, KycStatus } from "../types";
import { Lock } from "lucide-react";

interface KycLockedRoutesNoticeProps {
    identity: KycIdentityState;
    onVerify?: () => void;
    onRetry?: () => void;
}

export const KycLockedRoutesNotice = ({ identity, onVerify, onRetry }: KycLockedRoutesNoticeProps) => (
    <div className="flex flex-col gap-3 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-left text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
            <Lock className="mt-0.5 shrink-0 text-cyan-300" size={14} />
            <div>
                <p className=" text-text-100">KYC pools are excluded</p>
                <p className="text-text-300 text-xs">
                    {identity.status === KycStatus.ERROR
                        ? "Your verification status could not be checked. The displayed price only uses public pools."
                        : "A better route may be available through a KYC-restricted pool."}
                </p>
            </div>
        </div>

        {identity.status === KycStatus.ERROR && onRetry ? (
            <Button className="shrink-0" size="md" variant="outline" onClick={onRetry}>
                Retry status
            </Button>
        ) : onVerify ? (
            <Button className="shrink-0" size="md" variant="outline" onClick={onVerify}>
                Complete Demo KYC
            </Button>
        ) : null}
    </div>
);
