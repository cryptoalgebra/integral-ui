export const SwapField = {
    INPUT: "INPUT",
    OUTPUT: "OUTPUT",
    LIMIT_ORDER_PRICE: "LIMIT_ORDER_PRICE",
} as const;

export type SwapFieldType = (typeof SwapField)[keyof typeof SwapField];
