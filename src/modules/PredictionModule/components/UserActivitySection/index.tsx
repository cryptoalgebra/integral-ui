import { PredictionTradesTable } from "../../components";
import { usePredictionUserInfo } from "../../hooks/useUserInfo";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";

interface UserActivitySectionProps {
    marketId?: Address;
}

export function UserActivitySection({ marketId }: UserActivitySectionProps) {
    const { address: account } = useAccount();
    const { data: userInfo, loading } = usePredictionUserInfo(account, marketId);

    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-text-300">Connect your wallet to see your activity</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-text-300" />
            </div>
        );
    }

    if (!userInfo?.trades?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-text-300">No trades yet</p>
                <p className="text-xs text-text-400 mt-1">Your trading history will appear here</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl  overflow-hidden">
            <PredictionTradesTable trades={userInfo.trades} />
        </div>
    );
}
