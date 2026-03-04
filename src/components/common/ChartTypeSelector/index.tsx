import { CHART_TYPE, ChartTypeType, PoolChartTypeType } from "@/types/swap-chart";
import { cn } from "@/utils";

interface IChartTypeSelector {
    chartType: ChartTypeType | PoolChartTypeType;
    handleChangeChartType: (span: ChartTypeType | PoolChartTypeType) => void;
}

const titles = {
    [CHART_TYPE.TVL]: "TVL",
    [CHART_TYPE.VOLUME]: "Volume",
    [CHART_TYPE.FEES]: "Fees",
    [CHART_TYPE.PRICE]: "Price",
};

export function ChartTypeSelector({ chartType, handleChangeChartType }: IChartTypeSelector) {
    return (
        <div className="flex items-center gap-1 rounded-2xl border border-card-border bg-card-dark p-1">
            {Object.entries(titles).map(([type, title]) => {
                const isActive = chartType === type;

                return (
                    <button
                        key={type}
                        type="button"
                        onClick={() => handleChangeChartType(type as ChartTypeType)}
                        className={cn(
                            "h-10 rounded-xl px-4 text-sm font-semibold transition-colors",
                            isActive ? "border border-white/10 bg-card text-text-100" : "text-text-100/60 hover:bg-white/5 hover:text-text-100"
                        )}
                    >
                        {title}
                    </button>
                );
            })}
        </div>
    );
}
