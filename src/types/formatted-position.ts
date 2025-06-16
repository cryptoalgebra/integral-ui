export interface FormattedPosition {
    id: string;
    outOfRange: boolean;
    range: string;
    liquidityUSD: number;
    feesUSD: number | null;
    apr: number;
}
