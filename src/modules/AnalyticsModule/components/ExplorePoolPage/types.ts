export interface PoolAnalyticsStatistics {
    volume24H: string;
    fees24H: string;
    tvlUSD: string;
    tvlToken0: string;
    tvlToken1: string;
    tvlPercentChange: number;
    volumePercentChange: number;
    feesPercentChange: number;
    txCount: string;
    createdOn: string;
}

export interface PoolPriceQuote {
    baseSymbol: string;
    quoteSymbol: string;
    value: string;
}

export interface PoolPriceDetails {
    direct: PoolPriceQuote;
    inverse: PoolPriceQuote;
}
