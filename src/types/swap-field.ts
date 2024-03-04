
export const SwapField = {
    INPUT: 'INPUT',
    OUTPUT: 'OUTPUT',
} as const

export type SwapFieldType = typeof SwapField[keyof typeof SwapField]