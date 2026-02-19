import { useTokenDayDatasQuery, useTokenHourDatasQuery } from "@/graphql/generated/graphql";
import { useClients } from "@/hooks/graphql/useClients";
import { CandleChartDataPoint, CHART_SPAN, CHART_TYPE, ChartSpanType, PoolChartTypeType } from "@/types/swap-chart";
import { UNIX_TIMESTAMPS, isDefined } from "@/utils";
import { USE_UNISWAP_PLACEHOLDER_DATA } from "config/graphql-urls";
import { UTCTimestamp } from "lightweight-charts";
import { useMemo } from "react";
import { useUniswapTokenDatasQuery } from "./uniswap/useUniswapTokenDatasQuery";

const now = Math.floor(Date.now() / 1000);

const values = {
    [CHART_TYPE.TVL]: "totalValueLockedUSD",
    [CHART_TYPE.VOLUME]: "volumeUSD",
    [CHART_TYPE.FEES]: "feesUSD",
    [CHART_TYPE.PRICE]: "priceUSD",
} as const;

export function useTokenChartData(tokenId: string | undefined, span: ChartSpanType, chartType: PoolChartTypeType) {
    const { infoClient } = useClients();

    const { data: tokenIndexerDayDatas, loading: isTokenIndexerDayDatasLoading } = useTokenDayDatasQuery({
        variables: {
            token: tokenId?.toLowerCase() || "",
            from: now - UNIX_TIMESTAMPS[span] - UNIX_TIMESTAMPS[CHART_SPAN.DAY] * (span === CHART_SPAN.DAY ? 2 : 1),
            to: now,
        },
        client: infoClient,
        skip: USE_UNISWAP_PLACEHOLDER_DATA || !tokenId || span === CHART_SPAN.DAY || span === CHART_SPAN.WEEK,
    });

    const { data: tokenIndexerHourDatas, loading: isTokenIndexerHourDatasLoading } = useTokenHourDatasQuery({
        variables: {
            token: tokenId?.toLowerCase() || "",
            from: now - UNIX_TIMESTAMPS[span] - UNIX_TIMESTAMPS[CHART_SPAN.DAY],
            to: now,
        },
        client: infoClient,
        skip:
            USE_UNISWAP_PLACEHOLDER_DATA ||
            !tokenId ||
            span === CHART_SPAN.MONTH ||
            span === CHART_SPAN.THREE_MONTH ||
            span === CHART_SPAN.YEAR,
    });

    /* removable (placeholder data) */
    const { data: uniswapIndexerDayDatas, isLoading: isUniswapIndexerDayDatasLoading } = useUniswapTokenDatasQuery({
        variables: {
            token: tokenId?.toLowerCase() || "",
            from: now - UNIX_TIMESTAMPS[span] - UNIX_TIMESTAMPS[CHART_SPAN.DAY] * 2,
            to: now,
        },
        skip: !USE_UNISWAP_PLACEHOLDER_DATA || !tokenId || span === CHART_SPAN.DAY || span === CHART_SPAN.WEEK,
        span: "Day",
    });

    /* removable (placeholder data) */
    const { data: uniswapIndexerHourDatas, isLoading: isUniswapIndexerHourDatasLoading } = useUniswapTokenDatasQuery({
        variables: {
            token: tokenId?.toLowerCase() || "",
            from: now - UNIX_TIMESTAMPS[span] - UNIX_TIMESTAMPS[CHART_SPAN.DAY] * 2,
            to: now,
        },
        skip:
            !USE_UNISWAP_PLACEHOLDER_DATA ||
            !tokenId ||
            span === CHART_SPAN.MONTH ||
            span === CHART_SPAN.THREE_MONTH ||
            span === CHART_SPAN.YEAR,
        span: "Hour",
    });

    const tokenHourDatas = useMemo(() => {
        const _tokenHourDatas = USE_UNISWAP_PLACEHOLDER_DATA ? uniswapIndexerHourDatas?.data : tokenIndexerHourDatas;
        if (!_tokenHourDatas) return null;
        return _tokenHourDatas.tokenHourDatas.map((d) => ({
            ...d,
            date: (d as { periodStartUnix?: number; date?: number }).periodStartUnix ?? d.date,
        }));
    }, [tokenIndexerHourDatas, uniswapIndexerHourDatas?.data]);

    const tokenDayDatas = useMemo(() => {
        if (!tokenIndexerDayDatas && !uniswapIndexerDayDatas?.data) return [];
        const _tokenDayDatas = USE_UNISWAP_PLACEHOLDER_DATA ? uniswapIndexerDayDatas?.data : tokenIndexerDayDatas;
        return _tokenDayDatas.tokenDayDatas;
    }, [tokenIndexerDayDatas, uniswapIndexerDayDatas?.data]);

    const chartData = useMemo(() => {
        const poolDatas = span === CHART_SPAN.DAY ? tokenHourDatas : span === CHART_SPAN.WEEK ? tokenHourDatas : tokenDayDatas;

        if (!poolDatas?.[0]) return [];

        const value = values[chartType];

        const formattedData = poolDatas.filter(isDefined).map((v) => {
            return {
                time: v?.date as UTCTimestamp,
                value: Number(v[value]),
            };
        });

        return formattedData.slice(1);
    }, [tokenDayDatas, tokenHourDatas, span, chartType]);

    const candleChartData = useMemo((): CandleChartDataPoint[] => {
        const tokenDatas = span === CHART_SPAN.DAY ? tokenHourDatas : span === CHART_SPAN.WEEK ? tokenHourDatas : tokenDayDatas;

        if (!tokenDatas?.[0]) return [];

        return tokenDatas
            .filter(isDefined)
            .map((v) => {
                const chartPoint = v as typeof v & {
                    open?: string;
                    high?: string;
                    low?: string;
                    close?: string;
                };
                const fallbackPrice = Number(v.priceUSD);

                return {
                    time: v.date as UTCTimestamp,
                    open: Number(chartPoint.open ?? fallbackPrice),
                    high: Number(chartPoint.high ?? fallbackPrice),
                    low: Number(chartPoint.low ?? fallbackPrice),
                    close: Number(chartPoint.close ?? fallbackPrice),
                    volume: Number(v.volumeUSD),
                };
            })
            .slice(1);
    }, [tokenDayDatas, tokenHourDatas, span]);

    return {
        tokenDayDatas,
        tokenHourDatas,
        chartData: chartData,
        candleChartData,
        loading:
            isTokenIndexerDayDatasLoading ||
            isTokenIndexerHourDatasLoading ||
            isUniswapIndexerDayDatasLoading ||
            isUniswapIndexerHourDatasLoading,
    };
}
