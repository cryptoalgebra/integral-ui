import { useMemo, useState } from "react";
import { CHART_SPAN, CHART_TYPE, CHART_VIEW, ChartSpanType, ChartTypeType, ChartViewType } from "@/types/swap-chart";
import { Chart } from "../";
import { getPercentChange } from "@/utils";
import TotalStats from "../TotalStats";
import PageTitle from "@/components/common/PageTitle";
import { useDexChartData } from "@/hooks/analytics";

function ChartComponent({
    title,
    selector,
    chartType,
    chartView,
    height,
    showTypeSelector = false,
}: {
    title: string;
    selector: "tvlUSD" | "volumeUSD";
    chartType: ChartTypeType;
    chartView: ChartViewType;
    height: number;
    showTypeSelector?: boolean;
}) {
    const [span, setSpan] = useState<ChartSpanType>(CHART_SPAN.MONTH);
    const [type, setType] = useState<ChartTypeType>(chartType);

    const { chartData: chartData, loading: isChartDataLoading } = useDexChartData(span, selector);

    return (
        <Chart
            chartData={chartData}
            chartView={chartView}
            chartTitle={title}
            chartSpan={span}
            setChartSpan={setSpan}
            chartType={type}
            setChartType={setType}
            showTypeSelector={showTypeSelector}
            height={height}
            isChartDataLoading={isChartDataLoading}
        />
    );
}

export function DexCharts() {
    const { dexDayDatas, loading } = useDexChartData(CHART_SPAN.MONTH, "tvlUSD");

    const { currentTVL, currentVolume24H, currentFees24H } = useMemo(() => {
        if (!dexDayDatas)
            return {
                currentTVL: { value: 0, change: 0 },
                currentVolume24H: { value: 0, change: 0 },
                currentFees24H: { value: 0, change: 0 },
            };

        const now = dexDayDatas[dexDayDatas.length - 1];
        const dayAgo = dexDayDatas[dexDayDatas.length - 2];

        if (!now || !dayAgo)
            return {
                currentTVL: { value: 0, change: 0 },
                currentVolume24H: { value: 0, change: 0 },
                currentFees24H: { value: 0, change: 0 },
            };

        const nowTvl = Number(now.tvlUSD);
        const dayAgoTvl = Number(dayAgo.tvlUSD);

        const nowVolumeUsd = Number(now.volumeUSD);
        const dayAgoVolumeUsd = Number(dayAgo.volumeUSD);

        const nowFeesUsd = Number(now.feesUSD);
        const dayAgoFeesUsd = Number(dayAgo.feesUSD);

        const currentTVL = {
            value: nowTvl,
            change: getPercentChange(nowTvl, dayAgoTvl),
        };

        const currentVolume24H = {
            value: nowVolumeUsd,
            change: getPercentChange(nowVolumeUsd, dayAgoVolumeUsd),
        };

        const currentFees24H = {
            value: nowFeesUsd,
            change: getPercentChange(nowFeesUsd, dayAgoFeesUsd),
        };

        const currentTxCount = now.txCount;

        return {
            currentTVL,
            currentVolume24H,
            currentFees24H,
            currentTxCount,
        };
    }, [dexDayDatas]);

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between mb-8">
                <PageTitle title="Analytics" showSettings={false} />
            </div>
            <TotalStats isLoading={loading} currentTVL={currentTVL} currentVolume={currentVolume24H} currentFees={currentFees24H} />
            <div className="grid grid-rows-2 gap-3 lg:grid-cols-2 lg:grid-rows-1">
                <div className="rounded-xl border border-card-border bg-card pt-4">
                    <ChartComponent selector={"tvlUSD"} title={"TVL"} chartView={CHART_VIEW.AREA} chartType={CHART_TYPE.TVL} height={180} />
                </div>
                <div className="rounded-xl border border-card-border bg-card pt-4">
                    <ChartComponent
                        selector={"volumeUSD"}
                        title={"Volume"}
                        chartView={CHART_VIEW.AREA}
                        chartType={CHART_TYPE.VOLUME}
                        height={180}
                    />
                </div>
            </div>
        </div>
    );
}

export default DexCharts;
