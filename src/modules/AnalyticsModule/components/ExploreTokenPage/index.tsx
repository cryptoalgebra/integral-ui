import PageContainer from "@/components/common/PageContainer";
import PoolsList from "@/components/pools/PoolsList";
import { Chart } from "@/components/common/Chart";
import { useTokenChartData } from "@/hooks/analytics";
import { useCurrency } from "@/hooks/common/useCurrency";
import { useBlockExplorerURL } from "@/hooks/common/useBlockExplorer";
import { CHART_SPAN, CHART_TYPE, CHART_VIEW, ChartSpanType, PoolChartTypeType } from "@/types/swap-chart";
import { cn, getPercentChange } from "@/utils";
import { truncateHash } from "@/utils/common/truncateHash";
import { useLayoutEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useReadContracts } from "wagmi";
import { Address, erc20Abi, formatUnits } from "viem";
import { TransactionsList } from "../TransactionsList";
import { TokenHeroSection } from "./TokenHeroSection";
import { TokenMetricsGrid } from "./TokenMetricsGrid";
import { TokenOverviewSection } from "./TokenOverviewSection";
import { TokenAnalyticsStatistics, TokenMarketInsights } from "./types";

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

export function ExploreTokenPage() {
    const { tokenId } = useParams();
    const { pathname } = useLocation();
    const blockExplorerUrl = useBlockExplorerURL();

    const [type, setType] = useState<PoolChartTypeType>(CHART_TYPE.PRICE);
    const [span, setSpan] = useState<ChartSpanType>(CHART_SPAN.WEEK);
    const [activeSection, setActiveSection] = useState<"overview" | "pools" | "activity">("overview");

    const tokenAddress = tokenId as Address | undefined;
    const token = useCurrency(tokenAddress);

    const { tokenDayDatas, tokenHourDatas, chartData, loading: isChartDataLoading } = useTokenChartData(tokenId, span, type);

    const { data: tokenOnchainData } = useReadContracts({
        allowFailure: true,
        contracts: tokenAddress
            ? [
                  {
                      address: tokenAddress,
                      abi: erc20Abi,
                      functionName: "totalSupply",
                  },
              ]
            : [],
        query: {
            enabled: Boolean(tokenAddress),
        },
    });

    const statistics = useMemo<TokenAnalyticsStatistics | undefined>(() => {
        const tokenDatas = tokenDayDatas.length ? tokenDayDatas : tokenHourDatas || [];

        if (!tokenDatas[0]) return undefined;

        const currentTokenData = tokenDatas[tokenDatas.length - 1];
        const prevTokenData = tokenDatas[tokenDatas.length - 2];

        return {
            priceUSD: currentTokenData.priceUSD,
            tvlUSD: currentTokenData.totalValueLockedUSD,
            tvl: currentTokenData.totalValueLocked,
            volume24H: currentTokenData.volumeUSD,
            fees24H: currentTokenData.feesUSD,
            txCount: currentTokenData.token.txCount,
            pricePercentChange: getPercentChange(Number(currentTokenData.priceUSD), Number(prevTokenData?.priceUSD || 0)),
            tvlPercentChange: getPercentChange(
                Number(currentTokenData.totalValueLockedUSD),
                Number(prevTokenData?.totalValueLockedUSD || 0),
            ),
            volumePercentChange: getPercentChange(Number(currentTokenData.volumeUSD), Number(prevTokenData?.volumeUSD || 0)),
            feesPercentChange: getPercentChange(Number(currentTokenData.feesUSD), Number(prevTokenData?.feesUSD || 0)),
        };
    }, [tokenDayDatas, tokenHourDatas]);

    const handleSelectChartType = (nextType: PoolChartTypeType) => {
        setType(nextType);
        setActiveSection("overview");
    };

    const totalSupply = useMemo(() => {
        const rawSupply = tokenOnchainData?.[0]?.result;

        if (typeof rawSupply !== "bigint" || !token) return undefined;

        return formatUnits(rawSupply, token.decimals);
    }, [tokenOnchainData, token]);

    const marketInsights = useMemo<TokenMarketInsights>(() => {
        const activeTokenFromSeries =
            tokenDayDatas[tokenDayDatas.length - 1]?.token ||
            (tokenHourDatas && tokenHourDatas.length ? tokenHourDatas[tokenHourDatas.length - 1]?.token : undefined);
        const tokenEntity = activeTokenFromSeries;

        const priceUSD = Number(statistics?.priceUSD || 0);

        const totalSupplyValue = totalSupply ? Number(totalSupply) : undefined;
        const marketCapUSD = totalSupplyValue && Number.isFinite(totalSupplyValue) ? totalSupplyValue * priceUSD : undefined;

        return {
            totalSupply,
            marketCapUSD,
            allTimeVolumeUSD: Number(tokenEntity?.volumeUSD || 0),
            allTimeFeesUSD: Number(tokenEntity?.feesUSD || 0),
            allTimeTxCount: tokenEntity?.txCount || "0",
        };
    }, [statistics, tokenDayDatas, tokenHourDatas, totalSupply]);

    const chartView = useMemo(() => {
        switch (type) {
            case CHART_TYPE.TVL:
                return CHART_VIEW.AREA;
            case CHART_TYPE.VOLUME:
                return CHART_VIEW.BAR;
            case CHART_TYPE.FEES:
                return CHART_VIEW.BAR;
            case CHART_TYPE.PRICE:
                return CHART_VIEW.AREA;
            default:
                return CHART_VIEW.AREA;
        }
    }, [type]);

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const tokenExplorerUrl = tokenAddress ? `${blockExplorerUrl}/address/${tokenAddress}` : undefined;
    const tokenAddressLabel = tokenAddress ? truncateHash(tokenAddress) : "-";
    const backToPath = pathname.startsWith("/analytics") ? "/analytics/tokens" : "/explore/tokens";
    const sectionTabs = [
        { id: "overview" as const, label: "Overview" },
        { id: "pools" as const, label: "Pools" },
        { id: "activity" as const, label: "Activity" },
    ];

    return (
        <PageContainer>
            <TokenHeroSection
                token={token}
                tokenId={tokenId}
                tokenAddressLabel={tokenAddressLabel}
                tokenExplorerUrl={tokenExplorerUrl}
                backToPath={backToPath}
            />

            <TokenMetricsGrid activeChartType={type} onSelectChartType={handleSelectChartType} statistics={statistics} />

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
                        tokenA={token?.symbol}
                        isChartDataLoading={isChartDataLoading}
                    />

                    <TokenOverviewSection
                        token={token}
                        statistics={statistics}
                        marketInsights={marketInsights}
                        tokenAddress={tokenAddress}
                        tokenExplorerUrl={tokenExplorerUrl}
                    />
                </>
            ) : null}

            {activeSection === "pools" ? (
                <section className="space-y-5">
                    <h2 className="text-xl font-medium text-text">Pools</h2>
                    <PoolsList tokenId={tokenAddress} isExplore />
                </section>
            ) : null}

            {activeSection === "activity" ? (
                <section className="space-y-5">
                    <h2 className="text-xl font-medium text-text">Transactions</h2>
                    <TransactionsList tokenId={tokenAddress} />
                </section>
            ) : null}
        </PageContainer>
    );
}
