export const SwapPageView = {
    SWAP: 'SWAP',
} as const

export type SwapPageViewType = typeof SwapPageView[keyof typeof SwapPageView]

export interface SwapPageProps {
    type: SwapPageViewType
}