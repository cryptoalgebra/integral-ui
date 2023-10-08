export const SWAP_PAGE_TYPE = {
    SWAP: 'SWAP',
    LIMIT_ORDER: 'LIMIT_ORDER'
} as const

export type SwapPageType = typeof SWAP_PAGE_TYPE[keyof typeof SWAP_PAGE_TYPE]

export interface SwapPageProps {
    type: SwapPageType
}