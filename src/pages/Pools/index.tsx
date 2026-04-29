import PageContainer from "@/components/common/PageContainer";
import PoolsList from "@/components/pools/PoolsList";
import SecurityStatusTag from "@/components/pools/SecurityStatusTag";
import { useReadSecurityRegistryGlobalStatus } from "@/generated";
import { SecurityState } from "@/hooks/pools/usePool";
import { useFormattedPools } from "@/hooks/pools/useFormattedPools";
import PageTitle from "@/components/common/PageTitle";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import AnalyticsModule from "@/modules/AnalyticsModule";

const { DexChartsGrid } = AnalyticsModule.components;

const PoolsPage = () => {
    const { data: globalStatus } = useReadSecurityRegistryGlobalStatus();
    const { pools, isLoading } = useFormattedPools();

    const enableActions = globalStatus === SecurityState.ENABLED;
    // const totalTVL = pools.reduce((sum, pool) => sum + pool.tvlUSD, 0);
    // const totalVolume = pools.reduce((sum, pool) => sum + pool.volume24USD, 0);
    // const totalFees = pools.reduce((sum, pool) => sum + pool.fees24USD, 0);

    // const heroStats = [
    //     {
    //         label: "Pools",
    //         value: isLoading ? "..." : pools.length,
    //     },
    //     {
    //         label: "Total TVL",
    //         value: isLoading ? "..." : `$${formatAmount(totalTVL, 0)}`,
    //     },
    //     {
    //         label: "24H volume",
    //         value: isLoading ? "..." : `$${formatAmount(totalVolume, 0)}`,
    //     },
    //     {
    //         label: "24H fees",
    //         value: isLoading ? "..." : `$${formatAmount(totalFees, 0)}`,
    //     },
    // ];

    return (
        <PageContainer className="gap-6">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <PageTitle
                    title="Explore"
                    description="Discover and compare liquidity pools. Analyze liquidity, fees, and market activity in one place."
                />

                {!enableActions && <SecurityStatusTag status={globalStatus} />}

                {enableActions && (
                    <Button disabled className="w-fit whitespace-nowrap" variant="primary" size="md">
                        <Link className="flex gap-2 items-center" to="create">
                            <Plus size={18} />
                            Create Pool
                        </Link>
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-6">
                {/* <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {heroStats.map((stat) => (
                        <div key={stat.label} className="rounded-lg  bg-panel px-4 py-4 ">
                            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">{stat.label}</p>
                            <p className="mt-3 text-2xl font-medium tracking-tight text-text">{stat.value}</p>
                        </div>
                    ))}
                </div> */}
                <DexChartsGrid
                    containerClassName="grid gap-4 lg:grid-cols-2"
                    cardClassName="rounded-lg bg-card"
                    height={200}
                    volumeTitle="Volume"
                />
            </div>

            <PoolsList pools={pools} isLoading={isLoading} isExplore />
        </PageContainer>
    );
};

export default PoolsPage;
