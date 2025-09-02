import { Position } from "@cryptoalgebra/custom-pools-sdk";

export interface FormattedPosition {
    id: string;
    outOfRange: boolean;
    range: string;
    liquidityUSD: number;
    feesUSD: number | null;
    apr: number;
    rangeLength: number;
    position: Position | null;
    isALM: boolean;
    almVaultAddress: string | null;
    almShares: string | null;
    onFarming: boolean;
}
