import { Currency } from "@cryptoalgebra/integral-sdk";
import { Settings2 } from "lucide-react";
import { IDerivedMintInfo } from "@/state/mintStore";
import { IncreaseLiquidityModal } from "../IncreaseLiquidityModal";
import RemoveLiquidityModal from "../RemoveLiquidityModal";

interface ManageSectionProps {
    positionId: number;
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    mintInfo: IDerivedMintInfo;
    hasLiquidity: boolean;
    onRefetch?: () => void;
}

export function ManageSection({ positionId, currencyA, currencyB, mintInfo, hasLiquidity, onRefetch }: ManageSectionProps) {
    return (
        <div className="rounded-xl p-4 border border-card-border">
            <div className="flex items-center gap-2 mb-3">
                <Settings2 className="w-4 h-4 text-text/50" />
                <span className="text-xs text-text/50 uppercase tracking-wider">Manage Position</span>
            </div>

            <div className="flex items-center gap-3">
                <IncreaseLiquidityModal
                    tokenId={positionId}
                    currencyA={currencyA}
                    currencyB={currencyB}
                    mintInfo={mintInfo}
                    onSuccess={onRefetch}
                />
                {hasLiquidity && (
                    <RemoveLiquidityModal
                        positionId={positionId}
                        enableActions
                        // onSuccess={onRefetch}
                    />
                )}
            </div>
        </div>
    );
}
