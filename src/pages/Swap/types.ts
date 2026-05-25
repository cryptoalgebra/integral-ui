export const SwapPageView = {
    SWAP: "SWAP",
    LIMIT_ORDER: "LIMIT_ORDER",
    PREDICTION: "PREDICTION"
} as const;

export type SwapPageViewType = (typeof SwapPageView)[keyof typeof SwapPageView];

export interface SwapPageProps {
    type: SwapPageViewType;
}
