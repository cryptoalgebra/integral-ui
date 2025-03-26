export const TradeState = {
    LOADING: "LOADING",
    INVALID: "INVALID",
    NO_ROUTE_FOUND: "NO_ROUTE_FOUND",
    VALID: "VALID",
    SYNCING: "SYNCING",
};

export type TradeStateType = (typeof TradeState)[keyof typeof TradeState];
