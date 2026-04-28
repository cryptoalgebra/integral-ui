import PageContainer from "@/components/common/PageContainer";
import PageTitle from "@/components/common/PageTitle";
import EarnPoolsList, { EarnPoolListItem } from "@/components/earn/EarnPoolsList";
import CollectFeesAllModal from "@/components/modals/CollectFeesAllModal";
import PositionManagerModal from "@/components/modals/PositionManagerModal";
import { Button } from "@/components/ui/button";
import { ExtendedPosition, useExtendedPositions } from "@/hooks/earn/useExtendedPositions";
import { formatAmount } from "@/utils/common/formatAmount";
import { useMemo, useState } from "react";
import { useAccount } from "wagmi";

const EarnPage = () => {
    const { address: account } = useAccount();
    const { data: positions, pools, isLoading, refetch } = useExtendedPositions();

    const [selectedPosition, setSelectedPosition] = useState<ExtendedPosition | null>(null);

    const hasPositions = positions.length > 0;
    const totalClaimableFeesUSD = positions.reduce((acc, position) => acc + position.feesUSD, 0);

    const earnPools = useMemo<EarnPoolListItem[]>(() => {
        const positionsByPool = new Map<string, ExtendedPosition[]>();

        positions.forEach((position) => {
            const poolId = position.pool.id.toLowerCase();
            const currentPositions = positionsByPool.get(poolId) || [];

            currentPositions.push(position);
            positionsByPool.set(poolId, currentPositions);
        });

        return pools
            .map((pool) => {
                const poolPositions = positionsByPool.get(pool.id.toLowerCase()) || [];
                const amountUSD = poolPositions.reduce((sum, position) => sum + position.amountUSD, 0);
                const feesUSD = poolPositions.reduce((sum, position) => sum + position.feesUSD, 0);

                return {
                    pool,
                    amountUSD,
                    feesUSD,
                    positions: poolPositions,
                };
            })
            .sort((poolA, poolB) => {
                const hasUserPositionsA = poolA.positions.length > 0 ? 1 : 0;
                const hasUserPositionsB = poolB.positions.length > 0 ? 1 : 0;

                if (hasUserPositionsA !== hasUserPositionsB) {
                    return hasUserPositionsB - hasUserPositionsA;
                }

                if (poolA.amountUSD !== poolB.amountUSD) {
                    return poolB.amountUSD - poolA.amountUSD;
                }

                return poolB.pool.tvlUSD - poolA.pool.tvlUSD;
            });
    }, [pools, positions]);

    return (
        <PageContainer>
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <PageTitle
                    title="Earn"
                    description="Track pool APR, monitor your stake, and manage position rewards across all liquidity pools."
                />

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-stretch">
                    <div className="rounded-lg bg-panel px-4 py-3 sm:min-w-[220px]">
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">Claimable Fees</p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight text-text">
                            {account ? `$${formatAmount(totalClaimableFeesUSD, 2)}` : "-"}
                        </p>
                    </div>

                    <CollectFeesAllModal positions={positions}>
                        <Button variant="primary" size="md" className="whitespace-nowrap" disabled={!account || !hasPositions}>
                            Collect Fees
                        </Button>
                    </CollectFeesAllModal>
                </div>
            </div>

            <div className="flex w-full flex-col gap-2 md:gap-6">
                <EarnPoolsList pools={earnPools} loading={isLoading} onManagePosition={setSelectedPosition} />
            </div>

            <PositionManagerModal selectedPosition={selectedPosition} onClose={() => setSelectedPosition(null)} refetch={refetch} />
        </PageContainer>
    );
};

export default EarnPage;
