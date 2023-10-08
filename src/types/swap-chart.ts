export const SwapChartView = {
    CANDLES: 'CANDLES',
    LINE: 'LINE',
} as const

export type SwapChartViewType = typeof SwapChartView[keyof typeof SwapChartView]

export const SwapChartPair = {
    AB: 'AB',
    BA: 'BA',
    A: 'A',
    B: 'B',
} as const

export type SwapChartPairType = typeof SwapChartPair[keyof typeof SwapChartPair]

export const SwapChartSpan: { WEEK: 'week', DAY: 'day' } = {
    WEEK: "week",
    DAY: "day",
} as const

export type SwapChartSpanType = typeof SwapChartSpan[keyof typeof SwapChartSpan]