import { useLayoutEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CHART_SPAN, POOL_CHART_TYPE, CHART_VIEW, ChartSpanType, PoolChartTypeType } from "@/types/swap-chart";
import { SecurityState, usePool } from "@/hooks/pools/usePool";
import { Address } from "viem";
import { Chart } from "@/components/common/Chart";
import { formatAmount } from "@/utils";
import { TransactionsList } from "../TransactionsList";
import { getPercentChange } from "@/utils/common/getPercentChange";
import { unwrappedToken } from "@/utils/common/unwrappedToken";
import { usePoolChartData } from "@/hooks/analytics";
import PageContainer from "@/components/common/PageContainer";
import { useBlockExplorerURL } from "@/hooks/common/useBlockExplorer";
import { truncateHash } from "@/utils/common/truncateHash";
import { cn } from "@/utils";
import useSWR from "swr";
import { getPoolAPR } from "@/utils/pool/getPoolAPR";
import { PoolHeroSection } from "./PoolHeroSection";
import { PoolMetricsGrid } from "./PoolMetricsGrid";
import { PoolOverviewSection } from "./PoolOverviewSection";
import { PoolAnalyticsStatistics, PoolPriceDetails } from "./types";

const SectionTab = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "border-b px-1 pb-3 text-sm font-medium transition-colors duration-150",
            active ? "border-text text-text" : "border-transparent text-text-muted hover:text-text",
        )}
    >
        {children}
    </button>
);

export function ExplorePoolPage() {
    const { poolId } = useParams();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const blockExplorerUrl = useBlockExplorerURL();

    const [type, setType] = useState<PoolChartTypeType>(POOL_CHART_TYPE.TVL);
    const [span, setSpan] = useState<ChartSpanType>(CHART_SPAN.WEEK);
    const [activeSection, setActiveSection] = useState<"overview" | "activity">("overview");

    const [, pool, poolSecurityStatus] = usePool(poolId as Address);

    const enableActions = poolSecurityStatus === SecurityState.ENABLED;

    const { token0, token1 } = pool
        ? {
              token0: unwrappedToken(pool.token0),
              token1: unwrappedToken(pool.token1),
          }
        : {};

    const currentPrice = useMemo(() => {
        if (!pool || !token0 || !token1) return undefined;

        try {
            return pool.priceOf(pool.token0);
        } catch {
            return undefined;
        }
    }, [pool, token0, token1]);

    const { poolDayDatas, chartData, loading: isChartDataLoading } = usePoolChartData(poolId, span, type);
    const { data: apr } = useSWR(poolId ? ["analyticsPoolApr", poolId] : null, () => getPoolAPR(poolId as Address), {
        keepPreviousData: true,
    });

    const statistics = useMemo<PoolAnalyticsStatistics | undefined>(() => {
        if (!poolDayDatas[0]) return undefined;

        const currentPoolData = poolDayDatas[poolDayDatas.length - 1];
        const prevPoolData = poolDayDatas[poolDayDatas.length - 2];

        return {
            volume24H: currentPoolData.volumeUSD,
            fees24H: currentPoolData.feesUSD,
            tvlUSD: currentPoolData.tvlUSD,
            tvlToken0: currentPoolData.pool.totalValueLockedToken0,
            tvlToken1: currentPoolData.pool.totalValueLockedToken1,
            tvlPercentChange: getPercentChange(Number(currentPoolData.tvlUSD), Number(prevPoolData?.tvlUSD || 0)),
            volumePercentChange: getPercentChange(Number(currentPoolData.volumeUSD), Number(prevPoolData?.volumeUSD || 0)),
            feesPercentChange: getPercentChange(Number(currentPoolData.feesUSD), Number(prevPoolData?.feesUSD || 0)),
            txCount: currentPoolData.pool.txCount,
            createdOn: currentPoolData.pool.createdAtTimestamp,
        };
    }, [poolDayDatas]);

    const priceDetails = useMemo<PoolPriceDetails | null>(() => {
        if (!currentPrice || !token0 || !token1) return null;

        return {
            direct: {
                baseSymbol: token0.symbol || "Token 0",
                quoteSymbol: token1.symbol || "Token 1",
                value: formatAmount(currentPrice.toSignificant(8), 8),
            },
            inverse: {
                baseSymbol: token1.symbol || "Token 1",
                quoteSymbol: token0.symbol || "Token 0",
                value: formatAmount(currentPrice.invert().toSignificant(8), 8),
            },
        };
    }, [currentPrice, token0, token1]);

    const handleSelectChartType = (nextType: PoolChartTypeType) => {
        setType(nextType);
        setActiveSection("overview");
    };

    const chartView = useMemo(() => {
        switch (type) {
            case POOL_CHART_TYPE.TVL:
                return CHART_VIEW.AREA;
            case POOL_CHART_TYPE.VOLUME:
                return CHART_VIEW.BAR;
            case POOL_CHART_TYPE.FEES:
                return CHART_VIEW.BAR;
            case POOL_CHART_TYPE.PRICE:
                return CHART_VIEW.LINE;
            // case POOL_CHART_TYPE.APR:
            //     return CHART_VIEW.LINE;
            default:
                return CHART_VIEW.AREA;
        }
    }, [type]);

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const poolAddress = poolId as Address | undefined;
    const poolExplorerUrl = poolAddress ? `${blockExplorerUrl}/address/${poolAddress}` : undefined;
    const poolAddressLabel = poolAddress ? truncateHash(poolAddress) : "-";
    const sectionTabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "activity" as const, label: "Activity" },
    ];

    return (
        <PageContainer>
            <PoolHeroSection
                token0={token0}
                token1={token1}
                fee={pool?.fee}
                enableActions={enableActions}
                poolId={poolId}
                poolSecurityStatus={poolSecurityStatus}
                poolAddressLabel={poolAddressLabel}
                poolExplorerUrl={poolExplorerUrl}
                onSuccess={() => navigate("/pools")}
            />

            <PoolMetricsGrid
                activeChartType={type}
                apr={typeof apr === "number" ? Math.abs(apr) : undefined}
                onSelectChartType={handleSelectChartType}
                statistics={statistics}
            />

            <div className="flex items-center gap-6 border-b border-border">
                {sectionTabs.map((sectionTab) => (
                    <SectionTab
                        key={sectionTab.id}
                        active={activeSection === sectionTab.id}
                        onClick={() => setActiveSection(sectionTab.id)}
                    >
                        {sectionTab.label}
                    </SectionTab>
                ))}
            </div>

            {activeSection === "overview" ? (
                <>
                    <Chart
                        chartData={chartData}
                        chartSpan={span}
                        chartTitle={type}
                        chartView={chartView}
                        chartType={type}
                        setChartType={setType}
                        setChartSpan={setSpan}
                        showTypeSelector={false}
                        height={340}
                        tokenA={token0?.symbol}
                        tokenB={token1?.symbol}
                        isChartDataLoading={isChartDataLoading}
                    />
                    <PoolOverviewSection
                        token0={token0}
                        token1={token1}
                        statistics={statistics}
                        priceDetails={priceDetails}
                        createdAtTimestamp={statistics?.createdOn}
                    />
                </>
            ) : null}

            {activeSection === "activity" ? (
                <section className="space-y-5">
                    <h2 className="text-xl font-medium text-text">Transactions</h2>
                    <TransactionsList poolId={poolId} />
                </section>
            ) : null}
        </PageContainer>
    );
}
