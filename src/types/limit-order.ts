export const LimitOrderDirection = {
    SELL: 0,
    BUY: 1,
};

export type LimitOrderDirectionType = (typeof LimitOrderDirection)[keyof typeof LimitOrderDirection];
