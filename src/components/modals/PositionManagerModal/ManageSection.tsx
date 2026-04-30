import { Currency } from "@cryptoalgebra/integral-sdk";
import { Settings2 } from "lucide-react";
import { IDerivedMintInfo } from "@/state/mintStore";
import { IncreaseLiquidityModal } from "../IncreaseLiquidityModal";
import RemoveLiquidityModal from "../RemoveLiquidityModal";
import { cn } from "@/utils";
import { Address } from "viem";

interface ManageSectionProps {
    positionId: number;
    poolAddress: Address | undefined;
    currencyA: Currency | undefined;
    currencyB: Currency | undefined;
    mintInfo: IDerivedMintInfo;
    hasLiquidity: boolean;
    onRefetch?: () => void;
}

export function ManageSection({ positionId, poolAddress, currencyA, currencyB, mintInfo, hasLiquidity, onRefetch }: ManageSectionProps) {
    return (
        <section className="rounded-lg border border-border mt-auto p-3">
            <div className="mb-3 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-text-muted" />
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-muted">Manage position</span>
            </div>

            <div className={cn("grid gap-2", hasLiquidity ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                <IncreaseLiquidityModal
                    tokenId={positionId}
                    currencyA={currencyA}
                    currencyB={currencyB}
                    mintInfo={mintInfo}
                    poolAddress={poolAddress}
                    onSuccess={onRefetch}
                />
                {hasLiquidity && <RemoveLiquidityModal positionId={positionId} enableActions onSuccess={onRefetch} />}
            </div>
        </section>
    );
}
