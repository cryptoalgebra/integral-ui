import { useState } from "react";
import { useAccount } from "wagmi";
import { KycQuoteState } from "../types";
import { useKycIdentity, useTradeKycGate } from "../hooks";
import { KycLockedRoutesNotice } from "./KycLockedRoutesNotice";
import { KycSwapNotice } from "./KycSwapNotice";
import { KycVerificationModal } from "./KycVerificationModal";

interface KycSwapNoticeSectionProps {
    trade: unknown;
    quoteState: KycQuoteState;
}

export const KycSwapNoticeSection = ({ trade, quoteState }: KycSwapNoticeSectionProps) => {
    const { address: account } = useAccount();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tradeGate = useTradeKycGate(trade);
    const requiresKyc = quoteState.hasLockedKycRoutes || tradeGate.isKycRequired;
    const identity = useKycIdentity(requiresKyc);

    if (!requiresKyc) return null;

    return (
        <>
            {quoteState.hasLockedKycRoutes ? (
                <KycLockedRoutesNotice
                    identity={identity}
                    onVerify={account ? () => setIsModalOpen(true) : undefined}
                    onRetry={account ? identity.refetch : undefined}
                />
            ) : (
                <KycSwapNotice identity={identity} />
            )}
            {account && (
                <KycVerificationModal open={isModalOpen} onOpenChange={setIsModalOpen} identity={identity} />
            )}
        </>
    );
};
