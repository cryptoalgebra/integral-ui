export const SwapChartView = {
    CANDLES: 'CANDLES',
    LINE: 'LINE',
    TICKS: 'TICKS',
} as const

export type SwapChartViewType = typeof SwapChartView[keyof typeof SwapChartView]

export const SwapChartPair = {
    AB: 'AB',
    BA: 'BA',
    A: 'A',
    B: 'B',
} as const

export type SwapChartPairType = typeof SwapChartPair[keyof typeof SwapChartPair]

export const SwapChartSpan: { WEEK: 'week', DAY: 'day', MONTH: 'month' } = {
    WEEK: "week",
    DAY: "day",
    MONTH: 'month',
} as const

export type SwapChartSpanType = typeof SwapChartSpan[keyof typeof SwapChartSpan]