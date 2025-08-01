import { useAlgebraDayDatasQuery, useAlgebraHourDatasQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { CHART_SPAN, ChartSpanType } from "@/types/swap-chart";
import { UNIX_TIMESTAMPS, isDefined } from "@/utils";
import { USE_UNISWAP_PLACEHOLDER_DATA } from "config/graphql-urls";
import { UTCTimestamp } from "lightweight-charts";
import { useMemo } from "react";
import { useUniswapDayDatasQuery } from "./uniswap/useUniswapDayDatasQuery";

const now = Math.floor(Date.now() / 1000);

export function useDexChartData(span: ChartSpanType, selector: "tvlUSD" | "volumeUSD" = "tvlUSD") {
    const { infoClient } = useClients();

    const { data: algebraIndexerDayDatas, loading: isAlgebraIndexerDayDatasLoading } = useAlgebraDayDatasQuery({
        variables: {
            from: now - UNIX_TIMESTAMPS[span] - UNIX_TIMESTAMPS[CHART_SPAN.DAY] * 2,
            to: now,
        },
        client: infoClient,
        skip: USE_UNISWAP_PLACEHOLDER_DATA || span === CHART_SPAN.DAY || span === CHART_SPAN.WEEK,
    });

    const { data: algebraIndexerHourDatas, loading: isAlgebraIndexerHourDatasLoading } = useAlgebraHourDatasQuery({
        variables: {
            from: now - UNIX_TIMESTAMPS[span] - UNIX_TIMESTAMPS[CHART_SPAN.DAY],
            to: now,
        },
        client: infoClient,
        skip: USE_UNISWAP_PLACEHOLDER_DATA || span === CHART_SPAN.MONTH || span === CHART_SPAN.THREE_MONTH || span === CHART_SPAN.YEAR,
    });

    /* removable (placeholder data) */
    const { data: uniswapIndexerDayDatas, isLoading: isUniswapIndexerDayDatasLoading } = useUniswapDayDatasQuery({
        variables: {
            from: now - UNIX_TIMESTAMPS[span] - UNIX_TIMESTAMPS[CHART_SPAN.DAY] * 2,
            to: now,
        },
        skip: !USE_UNISWAP_PLACEHOLDER_DATA,
    });

    const dexHourDatas = useMemo(() => {
        return USE_UNISWAP_PLACEHOLDER_DATA
            ? uniswapIndexerDayDatas?.data.fusionDayDatas || []
            : algebraIndexerHourDatas?.algebraHourDatas || [];
    }, [algebraIndexerHourDatas, uniswapIndexerDayDatas]);

    const dexDayDatas = useMemo(() => {
        return USE_UNISWAP_PLACEHOLDER_DATA
            ? uniswapIndexerDayDatas?.data.fusionDayDatas || []
            : algebraIndexerDayDatas?.algebraDayDatas || [];
    }, [algebraIndexerDayDatas, uniswapIndexerDayDatas]);

    const chartData = useMemo(() => {
        const poolDatas = span === CHART_SPAN.DAY ? dexHourDatas : span === CHART_SPAN.WEEK ? dexHourDatas : dexDayDatas;
        if (!poolDatas) return [];

        return poolDatas
            .filter(isDefined)
            .map((v) => ({
                time: v.date as UTCTimestamp,
                value: Number(v[selector]),
            }))
            .slice(1);
    }, [dexDayDatas, dexHourDatas, selector, span]);

    return {
        dexHourDatas,
        dexDayDatas,
        chartData: chartData,
        loading: isAlgebraIndexerDayDatasLoading || isAlgebraIndexerHourDatasLoading || isUniswapIndexerDayDatasLoading,
    };
}
