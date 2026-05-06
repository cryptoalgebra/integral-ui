import { CHART_TYPE, PoolChartTypeType } from "@/types/swap-chart";
import { cn, formatAmount, formatPercent } from "@/utils";
import { TokenAnalyticsStatistics } from "./types";

function formatChangeValue(change = 0) {
    const formattedChange = formatPercent.format(change / 100);
    return `${change > 0 ? "+" : ""}${formattedChange}`;
}

function getChangeColor(change = 0) {
    if (change > 0) return "text-primary";
    if (change < 0) return "text-accent";
    return "text-text-muted";
}

interface MetricCardProps {
    label: string;
    value: string;
    change?: number;
    active?: boolean;
    onClick?: () => void;
}

function MetricCard({ label, value, change, active = false, onClick }: MetricCardProps) {
    const isInteractive = Boolean(onClick);
    const Component = onClick ? "button" : "div";

    return (
        <Component
            type={onClick ? "button" : undefined}
            onClick={onClick}
            className={cn(
                "rounded-lg px-4 py-4 text-left transition-colors duration-150",
                isInteractive ? "cursor-pointer hover:bg-panel/50" : "cursor-default",
                active ? "bg-primary/10 hover:bg-primary/10" : "bg-panel",
            )}
            aria-pressed={isInteractive ? active : undefined}
        >
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">{label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
                <p className="min-w-0 truncate text-2xl font-semibold tracking-tight text-text">{value}</p>
                {change !== undefined ? (
                    <span className={`text-xs font-medium ${getChangeColor(change)}`}>{formatChangeValue(change)}</span>
                ) : null}
            </div>
        </Component>
    );
}

interface TokenMetricsGridProps {
    activeChartType: PoolChartTypeType;
    onSelectChartType: (chartType: PoolChartTypeType) => void;
    statistics: TokenAnalyticsStatistics | undefined;
}

interface ChartMetricCard {
    chartType: PoolChartTypeType;
    change?: number;
    label: string;
    value: string;
}

export function TokenMetricsGrid({ activeChartType, onSelectChartType, statistics }: TokenMetricsGridProps) {
    const chartMetricCards: ChartMetricCard[] = [
        {
            chartType: CHART_TYPE.PRICE,
            change: statistics?.pricePercentChange,
            label: "Price",
            value: `$${formatAmount(statistics?.priceUSD || 0, 4)}`,
        },
        {
            chartType: CHART_TYPE.TVL,
            change: statistics?.tvlPercentChange,
            label: "TVL",
            value: `$${formatAmount(statistics?.tvlUSD || 0, 2)}`,
        },
        {
            chartType: CHART_TYPE.VOLUME,
            change: statistics?.volumePercentChange,
            label: "Volume 24H",
            value: `$${formatAmount(statistics?.volume24H || 0, 2)}`,
        },
        {
            chartType: CHART_TYPE.FEES,
            change: statistics?.feesPercentChange,
            label: "Fees 24H",
            value: `$${formatAmount(statistics?.fees24H || 0, 2)}`,
        },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {chartMetricCards.map((metricCard) => (
                <MetricCard
                    key={metricCard.chartType}
                    active={activeChartType === metricCard.chartType}
                    change={metricCard.change}
                    label={metricCard.label}
                    onClick={() => onSelectChartType(metricCard.chartType)}
                    value={metricCard.value}
                />
            ))}
        </div>
    );
}
