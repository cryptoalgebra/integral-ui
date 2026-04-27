import { CHART_SPAN, ChartSpanType } from "@/types/swap-chart";
import { Button } from "@/components/ui/button";

interface IChartSpanSelector {
    chartSpan: ChartSpanType;
    handleChangeChartSpan: (span: ChartSpanType) => void;
}

const titles = {
    [CHART_SPAN.DAY]: "1D",
    [CHART_SPAN.WEEK]: "7D",
    [CHART_SPAN.MONTH]: "1M",
    [CHART_SPAN.THREE_MONTH]: "3M",
    [CHART_SPAN.YEAR]: "1Y",
};

export function ChartSpanSelector({ chartSpan, handleChangeChartSpan }: IChartSpanSelector) {
    return (
        <div className="flex items-center gap-1 rounded-lg  p-1">
            {Object.entries(titles).map(([span, label]) => (
                <Button
                    size={"sm"}
                    key={span}
                    onClick={() => handleChangeChartSpan(span as ChartSpanType)}
                    variant={chartSpan === span ? "secondary" : "ghost"}
                    // disabled={chartSpan === span}
                >
                    {label}
                </Button>
            ))}
        </div>
    );
}
