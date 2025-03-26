export const SwapCallbackState = {
    INVALID: "INVALID",
    LOADING: "LOADING",
    VALID: "VALID",
};

export type SwapCallbackStateType = (typeof SwapCallbackState)[keyof typeof SwapCallbackState];
