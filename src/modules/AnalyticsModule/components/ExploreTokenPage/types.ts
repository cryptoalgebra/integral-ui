export interface TokenAnalyticsStatistics {
    priceUSD: string;
    tvlUSD: string;
    tvl: string;
    volume24H: string;
    fees24H: string;
    txCount: string;
    pricePercentChange: number;
    tvlPercentChange: number;
    volumePercentChange: number;
    feesPercentChange: number;
}

export interface TokenMarketInsights {
    totalSupply?: string;
    marketCapUSD?: number;
    allTimeVolumeUSD: number;
    allTimeFeesUSD: number;
    allTimeTxCount: string;
}
