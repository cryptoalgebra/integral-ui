import { InputModeV2, TimePeriodV2 } from "@/components/Charts/D3LiquidityRangeInputV2";
import { Chart } from "@/components/common/Chart";
import CurrencyLogo from "@/components/common/CurrencyLogo";
import { usePoolChartData } from "@/hooks/analytics";
import { useCurrency } from "@/hooks/common/useCurrency";
import { Deposit, EternalFarming } from "@/graphql/generated/graphql";
import { PositionFromTokenId } from "@/hooks/positions/usePositions";
import { Position } from "@cryptoalgebra/custom-pools-sdk";
import { CHART_SPAN, CHART_VIEW, ChartSpanType, POOL_CHART_TYPE, PoolChartTypeType } from "@/types/swap-chart";
import { formatAmount } from "@/utils/common/formatAmount";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useBlockExplorerURL } from "@/hooks/common/useBlockExplorer";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import CreatePositionLayout from "../layouts/CreatePositionLayout";
import { MiddleView } from "../types";
import SelectedPositionLayout from "../layouts/SelectedPositionLayout";
import { Copy, ExternalLink } from "lucide-react";

type PoolInfoItem = {
    label: string;
    value: string;
    change?: string;
    negative?: boolean;
    meta?: string;
    currency?: ReturnType<typeof useCurrency>;
};

interface PoolMiddleContentProps {
    poolId?: string;
    middleView: MiddleView;
    poolPriceLoading: boolean;
    densityLoading: boolean;
    chartReady: boolean;
    v2PriceData: { time: number; value: number; open: number; high: number; low: number; close: number }[];
    v2LiquidityData: { tick: number; price0: number; activeLiquidity: number }[];
    token0Symbol?: string;
    token1Symbol?: string;
    token0Address?: string;
    token1Address?: string;
    chartCurrentPrice?: number;
    chartMinPrice?: number;
    chartMaxPrice?: number;
    chartInputMode: InputModeV2;
    chartTimePeriod: TimePeriodV2;
    chartIsFullRange: boolean;
    setChartMinPrice: Dispatch<SetStateAction<number | undefined>>;
    setChartMaxPrice: Dispatch<SetStateAction<number | undefined>>;
    setChartInputMode: Dispatch<SetStateAction<InputModeV2>>;
    setChartTimePeriod: Dispatch<SetStateAction<TimePeriodV2>>;
    setChartIsFullRange: Dispatch<SetStateAction<boolean>>;
    selectedMinPrice?: number;
    selectedMaxPrice?: number;
    selectedPositionName: string | null;
    selectedSdkPosition: Position | null;
    selectedPositionTVL?: number;
    selectedPositionAPR?: number;
    selectedPositionOnFarming: boolean;
    selectedPositionFarmingDeposit: Deposit | null;
    activeFarming: EternalFarming | null;
    currentPoolPrice?: number;
    poolStatsLoading: boolean;
    poolAprLoading: boolean;
    poolInformation: {
        tvlUSD: number;
        volume24HUSD: number;
        fees24HUSD: number;
        averageApr: number;
    };
    poolInformationChange: {
        tvlUSD: number | null;
        volume24HUSD: number | null;
        fees24HUSD: number | null;
    };
    poolState: {
        liquidityUSD: number;
        token0Amount: number;
        token1Amount: number;
        token0PriceUSD: number;
        token1PriceUSD: number;
        txCount: number;
    };
    selectedPosition: PositionFromTokenId | null;
}

export default function PoolMiddleContent({
    poolId,
    middleView,
    poolPriceLoading,
    densityLoading,
    chartReady,
    v2PriceData,
    v2LiquidityData,
    token0Symbol,
    token1Symbol,
    token0Address,
    token1Address,
    chartCurrentPrice,
    chartMinPrice,
    chartMaxPrice,
    chartInputMode,
    chartTimePeriod,
    chartIsFullRange,
    setChartMinPrice,
    setChartMaxPrice,
    setChartInputMode,
    setChartTimePeriod,
    setChartIsFullRange,
    selectedMinPrice,
    selectedMaxPrice,
    selectedPositionName,
    selectedSdkPosition,
    selectedPositionTVL,
    selectedPositionAPR,
    selectedPositionOnFarming,
    selectedPositionFarmingDeposit,
    activeFarming,
    currentPoolPrice,
    poolStatsLoading,
    poolInformation,
    poolInformationChange,
    poolState,
    selectedPosition,
}: PoolMiddleContentProps) {
    const { toast } = useToast();
    const blockExplorerURL = useBlockExplorerURL();
    const token0Currency = useCurrency(token0Address as `0x${string}`, true);
    const token1Currency = useCurrency(token1Address as `0x${string}`, true);
    const [overviewType, setOverviewType] = useState<PoolChartTypeType>(POOL_CHART_TYPE.TVL);
    const [overviewSpan, setOverviewSpan] = useState<ChartSpanType>(CHART_SPAN.MONTH);
    const [priceSpan, setPriceSpan] = useState<ChartSpanType>(CHART_SPAN.DAY);
    const { chartData: overviewChartData, candleChartData: overviewCandleChartData, loading: overviewChartLoading } = usePoolChartData(
        poolId,
        overviewSpan,
        overviewType
    );
    const { chartData: priceChartData, candleChartData: priceCandleChartData, loading: priceChartLoading } = usePoolChartData(
        poolId,
        priceSpan,
        POOL_CHART_TYPE.PRICE,
        false
    );

    const overviewChartView = useMemo(() => {
        switch (overviewType) {
            case POOL_CHART_TYPE.TVL:
                return CHART_VIEW.AREA;
            case POOL_CHART_TYPE.VOLUME:
                return CHART_VIEW.BAR;
            case POOL_CHART_TYPE.FEES:
                return CHART_VIEW.BAR;
            case POOL_CHART_TYPE.PRICE:
                return CHART_VIEW.CANDLE;
            default:
                return CHART_VIEW.AREA;
        }
    }, [overviewType]);
    const poolExplorerUrl = useMemo(() => {
        if (!poolId) return null;

        return `${blockExplorerURL.replace(/\/$/, "")}/address/${poolId}`;
    }, [blockExplorerURL, poolId]);
    const handleCopyPoolAddress = () => {
        if (!poolId) return;

        navigator.clipboard.writeText(poolId);
        toast({
            title: "Copied",
            description: "Pool address copied to clipboard",
        });
    };
    const formatChange = (value: number | null) => {
        if (value === null || Number.isNaN(value)) return "N/A";

        const sign = value > 0 ? "+" : "";

        return `${sign}${formatAmount(value, 2)}%`;
    };
    const poolInfoColumns = useMemo<PoolInfoItem[][]>(
        () => [
            [
                {
                    label: "24h Volume",
                    value: poolStatsLoading ? "..." : `$${formatAmount(poolInformation.volume24HUSD, 2)}`,
                    change: formatChange(poolInformationChange.volume24HUSD),
                    negative: poolInformationChange.volume24HUSD !== null && poolInformationChange.volume24HUSD < 0,
                },
                {
                    label: "24h Fees",
                    value: poolStatsLoading ? "..." : `$${formatAmount(poolInformation.fees24HUSD, 2)}`,
                    change: formatChange(poolInformationChange.fees24HUSD),
                    negative: poolInformationChange.fees24HUSD !== null && poolInformationChange.fees24HUSD < 0,
                },
                {
                    label: "Transactions",
                    value: poolStatsLoading ? "..." : formatAmount(poolState.txCount, 0),
                },
            ],
            [
                {
                    label: "Pool Liquidity",
                    value: poolStatsLoading ? "..." : `$${formatAmount(poolState.liquidityUSD, 2)}`,
                    change: formatChange(poolInformationChange.tvlUSD),
                    negative: poolInformationChange.tvlUSD !== null && poolInformationChange.tvlUSD < 0,
                },
                {
                    label: token0Symbol || "Token 0 Reserve",
                    value: poolStatsLoading ? "..." : formatAmount(poolState.token0Amount, 4),
                    meta: poolStatsLoading ? undefined : `$${formatAmount(poolState.token0PriceUSD, 4)}`,
                    currency: token0Currency,
                },
                {
                    label: token1Symbol || "Token 1 Reserve",
                    value: poolStatsLoading ? "..." : formatAmount(poolState.token1Amount, 4),
                    meta: poolStatsLoading ? undefined : `$${formatAmount(poolState.token1PriceUSD, 4)}`,
                    currency: token1Currency,
                },
            ],
            [
                {
                    label: "Current Price",
                    value:
                        currentPoolPrice && Number.isFinite(currentPoolPrice)
                            ? `1 ${token0Symbol || "Token 0"} = ${formatAmount(currentPoolPrice, 6)} ${token1Symbol || "Token 1"}`
                            : "N/A",
                },
                {
                    label: "Average APR",
                    value: poolStatsLoading ? "..." : `${formatAmount(poolInformation.averageApr, 2)}%`,
                },
            ],
        ],
        [
            currentPoolPrice,
            poolInformation.fees24HUSD,
            poolInformation.volume24HUSD,
            poolInformation.averageApr,
            poolInformationChange.fees24HUSD,
            poolInformationChange.tvlUSD,
            poolInformationChange.volume24HUSD,
            poolState.liquidityUSD,
            poolState.token0Amount,
            poolState.token0PriceUSD,
            poolState.token1Amount,
            poolState.token1PriceUSD,
            poolState.txCount,
            poolStatsLoading,
            token0Currency,
            token0Symbol,
            token1Currency,
            token1Symbol,
        ]
    );
    
    return (
        <main className="min-w-0 flex-1">
            {middleView === "POOL_INFO" && (
                <section className="min-h-[640px] space-y-7 bg-card-background p-8 pl-4 text-left animate-fade-in">
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center">
                                <CurrencyLogo currency={token0Currency} size={34} />
                                <CurrencyLogo className="-ml-3" currency={token1Currency} size={34} />
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-3xl font-bold leading-tight">
                                    {token0Symbol && token1Symbol ? `${token0Symbol} / ${token1Symbol}` : "Pool"}
                                </h1>
                                {poolId && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-foreground/70 hover:text-foreground"
                                        onClick={handleCopyPoolAddress}
                                        title="Copy pool address"
                                        aria-label="Copy pool address"
                                    >
                                        <Copy size={16} />
                                    </Button>
                                )}
                                {poolExplorerUrl && (
                                    <a
                                        href={poolExplorerUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-white/5 hover:text-foreground"
                                        title="View on Basescan"
                                        aria-label="View pool on Basescan"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    <div id="pool-state" className="scroll-mt-24 space-y-4">
                        <Chart
                            chartData={priceChartData}
                            candleChartData={priceCandleChartData}
                            chartSpan={priceSpan}
                            chartTitle={POOL_CHART_TYPE.PRICE}
                            chartView={CHART_VIEW.CANDLE}
                            chartType={POOL_CHART_TYPE.TVL}
                            setChartType={setOverviewType}
                            setChartSpan={setPriceSpan}
                            showTypeSelector={false}
                            height={320}
                            tokenA={token0Symbol}
                            tokenB={token1Symbol}
                            isChartDataLoading={priceChartLoading}
                        />
                        <div className="overflow-hidden rounded-2xl border border-card-border bg-background/20">
                            <div className="grid grid-cols-1 divide-y divide-card-border/70 md:grid-cols-2 md:divide-y-0 xl:grid-cols-3 xl:divide-x">
                                {poolInfoColumns.map((column, columnIndex) => (
                                    <div key={`pool-info-column-${columnIndex}`} className="space-y-4 px-4 py-4 sm:px-5">
                                        {column.map((item) => (
                                            <div key={item.label} className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-foreground/60 sm:text-sm">
                                                        {item.currency ? <CurrencyLogo currency={item.currency} size={16} /> : null}
                                                        <span>{item.label}</span>
                                                    </div>
                                                    {item.meta ? <p className="mt-0.5 text-[11px] text-foreground/45">{item.meta}</p> : null}
                                                </div>
                                                <div className="min-w-0 text-right">
                                                    <p className="text-[16px] font-semibold leading-snug text-foreground break-words">
                                                        {item.value}
                                                    </p>
                                                    {item.change ? (
                                                        <p
                                                            className={`mt-0.5 text-[11px] font-medium sm:text-xs ${
                                                                item.negative ? "text-rose-400" : "text-emerald-400"
                                                            }`}
                                                        >
                                                            {item.change}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div id="overview" className="scroll-mt-24 space-y-3">
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                            <button
                                type="button"
                                onClick={() => setOverviewType(POOL_CHART_TYPE.TVL)}
                                className={`rounded-2xl p-4 text-left transition-colors ${
                                    overviewType === POOL_CHART_TYPE.TVL
                                        ? "border border-primary/80 bg-background/30"
                                        : "border border-card-border bg-background/20 hover:bg-background/30"
                                }`}
                            >
                                <p className="text-sm text-foreground/70">Total Value Locked</p>
                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <p className="text-3xl font-bold leading-none">
                                        {poolStatsLoading ? "..." : `$${formatAmount(poolInformation.tvlUSD, 2)}`}
                                    </p>
                                    <p className="text-xl leading-none text-emerald-400">{formatChange(poolInformationChange.tvlUSD)}</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setOverviewType(POOL_CHART_TYPE.VOLUME)}
                                className={`rounded-2xl p-4 text-left transition-colors ${
                                    overviewType === POOL_CHART_TYPE.VOLUME
                                        ? "border border-primary/80 bg-background/30"
                                        : "border border-card-border bg-background/20 hover:bg-background/30"
                                }`}
                            >
                                <p className="text-sm text-foreground/70">Volume 24H</p>
                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <p className="text-3xl font-bold leading-none">
                                        {poolStatsLoading ? "..." : `$${formatAmount(poolInformation.volume24HUSD, 2)}`}
                                    </p>
                                    <p className="text-xl leading-none text-emerald-400">{formatChange(poolInformationChange.volume24HUSD)}</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setOverviewType(POOL_CHART_TYPE.FEES)}
                                className={`rounded-2xl p-4 text-left transition-colors ${
                                    overviewType === POOL_CHART_TYPE.FEES
                                        ? "border border-primary/80 bg-background/30"
                                        : "border border-card-border bg-background/20 hover:bg-background/30"
                                }`}
                            >
                                <p className="text-sm text-foreground/70">DEX Fees 24H</p>
                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <p className="text-3xl font-bold leading-none">
                                        {poolStatsLoading ? "..." : `$${formatAmount(poolInformation.fees24HUSD, 2)}`}
                                    </p>
                                    <p className="text-xl leading-none text-emerald-400">{formatChange(poolInformationChange.fees24HUSD)}</p>
                                </div>
                            </button>
                        </div>
                        <div>
                            <Chart
                                chartData={overviewChartData}
                                candleChartData={overviewCandleChartData}
                                chartSpan={overviewSpan}
                                chartTitle={overviewType}
                                chartView={overviewChartView}
                                chartType={overviewType}
                                setChartType={setOverviewType}
                                setChartSpan={setOverviewSpan}
                                showTypeSelector={false}
                                height={260}
                                tokenA={token0Symbol}
                                tokenB={token1Symbol}
                                isChartDataLoading={overviewChartLoading}
                            />
                        </div>
                    </div>

                </section>
            )}

            {middleView === "NEW_POSITION" && (
                <CreatePositionLayout
                    poolId={poolId}
                    poolPriceLoading={poolPriceLoading}
                    densityLoading={densityLoading}
                    chartReady={chartReady}
                    v2PriceData={v2PriceData}
                    v2LiquidityData={v2LiquidityData}
                    token0Symbol={token0Symbol}
                    token1Symbol={token1Symbol}
                    token0Address={token0Address}
                    token1Address={token1Address}
                    chartCurrentPrice={chartCurrentPrice}
                    chartMinPrice={chartMinPrice}
                    chartMaxPrice={chartMaxPrice}
                    chartInputMode={chartInputMode}
                    chartTimePeriod={chartTimePeriod}
                    chartIsFullRange={chartIsFullRange}
                    setChartMinPrice={setChartMinPrice}
                    setChartMaxPrice={setChartMaxPrice}
                    setChartInputMode={setChartInputMode}
                    setChartTimePeriod={setChartTimePeriod}
                    setChartIsFullRange={setChartIsFullRange}
                />
            )}

            {middleView === "POSITION" && selectedPosition && (
                <SelectedPositionLayout
                    selectedPosition={selectedPosition}
                    poolPriceLoading={poolPriceLoading}
                    densityLoading={densityLoading}
                    chartReady={chartReady}
                    v2PriceData={v2PriceData}
                    v2LiquidityData={v2LiquidityData}
                    token0Symbol={token0Symbol}
                    token1Symbol={token1Symbol}
                    token0Address={token0Address}
                    token1Address={token1Address}
                    chartCurrentPrice={chartCurrentPrice}
                    chartInputMode={chartInputMode}
                    chartTimePeriod={chartTimePeriod}
                    setChartInputMode={setChartInputMode}
                    setChartTimePeriod={setChartTimePeriod}
                    selectedMinPrice={selectedMinPrice}
                    selectedMaxPrice={selectedMaxPrice}
                    selectedPositionName={selectedPositionName}
                    selectedSdkPosition={selectedSdkPosition}
                    selectedPositionTVL={selectedPositionTVL}
                    selectedPositionAPR={selectedPositionAPR}
                    selectedPositionOnFarming={selectedPositionOnFarming}
                    selectedPositionFarmingDeposit={selectedPositionFarmingDeposit}
                    activeFarming={activeFarming}
                    currentPoolPrice={currentPoolPrice}
                />
            )}

            {middleView === "POSITION" && !selectedPosition && (
                <section className="min-h-[640px] rounded-none border border-dashed border-card-border bg-black/10 p-4">
                    <h3 className="text-sm font-medium">Position</h3>
                    <p className="mt-2 text-sm text-foreground/60">No position selected.</p>
                </section>
            )}

            {middleView === "FARMING" && (
                <section className="min-h-[640px] rounded-none border border-dashed border-card-border bg-black/10 p-4">
                    <h3 className="text-sm font-medium">Farming</h3>
                </section>
            )}

            {middleView === "AI_ASSISTANT" && (
                <section className="min-h-[640px] rounded-none border border-dashed border-card-border bg-black/10 p-4">
                    <h3 className="text-sm font-medium">AI Assistant Mode</h3>
                </section>
            )}
        </main>
    );
}
