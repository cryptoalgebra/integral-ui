import PageContainer from "@/components/common/PageContainer";
import PoolsList from "@/components/pools/PoolsList";
import SecurityStatusTag from "@/components/pools/SecurityStatusTag";
import { Button } from "@/components/ui/button";
import { useReadSecurityRegistryGlobalStatus } from "@/generated";
import { SecurityState } from "@/hooks/pools/usePool";
import { useFormattedPools } from "@/hooks/pools/useFormattedPools";
import { formatAmount } from "@/utils/common/formatAmount";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import PageTitle from "@/components/common/PageTitle";

const PoolsPage = () => {
    const { data: globalStatus } = useReadSecurityRegistryGlobalStatus();
    const { pools, isLoading } = useFormattedPools();

    const enableActions = globalStatus === SecurityState.ENABLED;
    const totalTVL = pools.reduce((sum, pool) => sum + pool.tvlUSD, 0);
    const totalVolume = pools.reduce((sum, pool) => sum + pool.volume24USD, 0);
    const totalFees = pools.reduce((sum, pool) => sum + pool.fees24USD, 0);

    const heroStats = [
        {
            label: "Pools",
            value: isLoading ? "..." : pools.length,
        },
        {
            label: "Total TVL",
            value: isLoading ? "..." : `$${formatAmount(totalTVL, 0)}`,
        },
        {
            label: "24H volume",
            value: isLoading ? "..." : `$${formatAmount(totalVolume, 0)}`,
        },
        {
            label: "24H fees",
            value: isLoading ? "..." : `$${formatAmount(totalFees, 0)}`,
        },
    ];

    return (
        <PageContainer className="gap-5 md:gap-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <PageTitle
                    title="Pools"
                    description="Discover and compare liquidity pools. Analyze performance, track fees, and start earning in seconds."
                />

                {!enableActions && <SecurityStatusTag status={globalStatus} />}

                {enableActions && (
                    <Button className="w-fit whitespace-nowrap" asChild variant="primary" size="md">
                        <Link to="create">
                            <Plus size={18} />
                            Create Pool
                        </Link>
                    </Button>
                )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {heroStats.map((stat) => (
                    <div key={stat.label} className="rounded-lg  bg-panel px-4 py-4 ">
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">{stat.label}</p>
                        <p className="mt-3 text-2xl font-semibold tracking-tight text-text">{stat.value}</p>
                    </div>
                ))}
            </div>

            <PoolsList pools={pools} isLoading={isLoading} />
        </PageContainer>
    );
};

export default PoolsPage;
